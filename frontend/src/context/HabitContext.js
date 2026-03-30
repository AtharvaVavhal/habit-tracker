import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import * as api from "../api";

const HabitContext = createContext(null);

const today = () => new Date().toISOString().slice(0, 10);

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [creatingHabit, setCreatingHabit] = useState(false);
  const [completingIds, setCompletingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const revalidateIdRef = useRef(0);
  const abortRef = useRef(null);

  // Backward compat for HabitItem (union of both sets)
  const pendingIds = new Set([...completingIds, ...deletingIds]);

  const revalidate = useCallback(() => {
    // Cancel any in-flight fetch
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const id = ++revalidateIdRef.current;
    setIsRefreshing(true);

    return Promise.all([api.getHabits(signal), api.getGlobalStats(signal)])
      .then(([habitsData, statsData]) => {
        if (id !== revalidateIdRef.current || signal.aborted) return;
        setHabits(habitsData);
        setGlobalStats(statsData);
        setError(null);
      })
      .catch((err) => {
        // Ignore cancellations
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError" || err?.name === "AbortError") return;
        if (id !== revalidateIdRef.current) return;
        console.error("Revalidation failed:", err);
        setError("Failed to refresh data.");
      })
      .finally(() => {
        if (id === revalidateIdRef.current) setIsRefreshing(false);
      });
  }, []);

  const resetInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(revalidate, 60000);
  }, [revalidate]);

  useEffect(() => {
    revalidate().finally(() => setInitialLoading(false));
    intervalRef.current = setInterval(revalidate, 60000);
    return () => {
      clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [revalidate]);

  const createHabit = async (data) => {
    if (creatingHabit) return;
    setCreatingHabit(true);
    setError(null);

    // Optimistic: show temp entry immediately
    const tempId = `temp-${Date.now()}`;
    setHabits((prev) => [
      ...prev,
      { id: tempId, name: data.name, type: data.type, created_at: new Date().toISOString(), _temp: true },
    ]);

    try {
      await api.createHabit(data);
      await revalidate(); // replaces temp with real server data
      resetInterval();
    } catch (err) {
      console.error("Failed to create habit:", err);
      setError("Failed to create habit.");
      setHabits((prev) => prev.filter((h) => h.id !== tempId)); // rollback temp
    } finally {
      setCreatingHabit(false);
    }
  };

  const completeHabit = (id) => {
    const previousStats = globalStats;
    setCompletingIds((prev) => new Set(prev).add(id));

    if (globalStats) {
      setGlobalStats((prev) => ({
        ...prev,
        last_7_days: prev.last_7_days.map((d) =>
          d.date === today() ? { ...d, completed: d.completed + 1 } : d
        ),
      }));
    }

    return api.completeHabit(id)
      .then(() => { revalidate(); resetInterval(); })
      .catch((err) => {
        console.error("Failed to complete habit:", err);
        setGlobalStats(previousStats);
        setError("Failed to mark habit as done.");
      })
      .finally(() => {
        setCompletingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      });
  };

  const deleteHabit = (id) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    setHabits((prev) => prev.filter((h) => h.id !== id)); // optimistic remove

    return api.deleteHabit(id)
      .then(() => { revalidate(); resetInterval(); })
      .catch((err) => {
        console.error("Failed to delete habit:", err);
        setError("Failed to delete habit.");
        revalidate(); // restore on failure
      })
      .finally(() => {
        setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      });
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        globalStats,
        pendingIds,
        completingIds,
        deletingIds,
        creatingHabit,
        initialLoading,
        isRefreshing,
        error,
        createHabit,
        completeHabit,
        deleteHabit,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  return useContext(HabitContext);
}
