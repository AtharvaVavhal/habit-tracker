import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import * as api from "../api";

const HabitContext = createContext(null);

const today = () => new Date().toISOString().slice(0, 10);

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const revalidateIdRef = useRef(0);

  const fetchHabits = useCallback(() => {
    return api.getHabits().then(setHabits).catch((err) => {
      console.error("Failed to fetch habits:", err);
      setError("Failed to load habits.");
    });
  }, []);

  const fetchGlobalStats = useCallback(() => {
    return api.getGlobalStats().then(setGlobalStats).catch((err) => {
      console.error("Failed to fetch stats:", err);
      setError("Failed to load stats.");
    });
  }, []);

  const revalidate = useCallback(() => {
    const id = ++revalidateIdRef.current;
    setIsRefreshing(true);
    return Promise.all([api.getHabits(), api.getGlobalStats()])
      .then(([habitsData, statsData]) => {
        if (id !== revalidateIdRef.current) return;
        setHabits(habitsData);
        setGlobalStats(statsData);
      })
      .catch((err) => {
        console.error("Revalidation failed:", err);
        setError("Failed to refresh data.");
      })
      .finally(() => {
        if (id === revalidateIdRef.current) setIsRefreshing(false);
      });
  }, []);

  const resetInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => revalidate(), 60000);
  }, [revalidate]);

  useEffect(() => {
    Promise.all([fetchHabits(), fetchGlobalStats()])
      .finally(() => setInitialLoading(false));

    intervalRef.current = setInterval(() => revalidate(), 60000);
    return () => clearInterval(intervalRef.current);
  }, [fetchHabits, fetchGlobalStats, revalidate]);

 const createHabit = async (data) => {
  try {
    await api.createHabit(data);

    // 🔥 force fresh data
    const [habitsData, statsData] = await Promise.all([
      api.getHabits(),
      api.getGlobalStats(),
    ]);

    setHabits(habitsData);
    setGlobalStats(statsData);

  } catch (err) {
    console.error("Failed to create habit:", err);
    setError("Failed to create habit.");
  }
};

  const completeHabit = (id) => {
    const previousStats = globalStats;

    setPendingIds((prev) => new Set(prev).add(id));

    if (globalStats) {
      setGlobalStats((prev) => ({
        ...prev,
        last_7_days: prev.last_7_days.map((d) =>
          d.date === today() ? { ...d, completed: d.completed + 1 } : d
        ),
      }));
    }

    return api.completeHabit(id)
      .then(() => {
        revalidate();
        resetInterval();
      })
      .catch((err) => {
        console.error("Failed to complete habit:", err);
        setGlobalStats(previousStats);
        setError("Failed to mark habit as done.");
      })
      .finally(() => {
        setPendingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      });
  };

  const deleteHabit = (id) => {
    return api.deleteHabit(id)
      .then(() => {
        revalidate();
        resetInterval();
      })
      .catch((err) => {
        console.error("Failed to delete habit:", err);
        setError("Failed to delete habit.");
      });
  };

  return (
    <HabitContext.Provider
      value={{ habits, globalStats, pendingIds, initialLoading, isRefreshing, error, fetchHabits, fetchGlobalStats, createHabit, completeHabit, deleteHabit }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  return useContext(HabitContext);
}
