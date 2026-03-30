import { useState, useEffect, useRef } from "react";
import { getHabitStats } from "../api";
import { useHabits } from "../context/HabitContext";

function HabitItem({ habit }) {
  const { completeHabit, deleteHabit, completingIds, deletingIds } = useHabits();
  const isCompleting = completingIds.has(habit.id);
  const isDeleting = deletingIds.has(habit.id);
  const isDone = Boolean(habit.completed_today);
  const [flash, setFlash] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [stat, setStat] = useState(null);
  const prevDone = useRef(isDone);

  useEffect(() => {
    if (!prevDone.current && isDone) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 750);
      return () => clearTimeout(t);
    }
    prevDone.current = isDone;
  }, [isDone]);

  const fetchStat = () => {
    setStat({ loading: true, data: null, error: false });
    getHabitStats(habit.id)
      .then((data) => setStat({ loading: false, data, error: false }))
      .catch(() => setStat({ loading: false, data: null, error: true }));
  };

  const toggle = () => {
    if (habit._temp) return;
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (!stat?.data && !stat?.loading) fetchStat();
  };

  const handleComplete = () => {
    if (isCompleting || isDone || habit._temp) return;
    completeHabit(habit.id).then(() => {
      if (expanded) fetchStat();
    });
  };

  const classes = [
    "habit-item",
    isDone ? "habit-item--done" : "",
    flash ? "habit-item--flash" : "",
    habit._temp ? "habit-item--temp" : "",
  ].filter(Boolean).join(" ");

  return (
    <li className={classes}>
      <div className="habit-item__row">
        <button type="button" className="habit-item__info" onClick={toggle}>
          <span className="habit-item__name">{habit.name}</span>
          <span className="habit-item__badge">{habit.type}</span>
        </button>

        <div className="habit-item__actions">
          {habit._temp ? (
            <span className="habit-item__adding">Adding…</span>
          ) : (
            <>
              <button
                type="button"
                className={`habit-item__done-btn${isDone ? " habit-item__done-btn--checked" : ""}`}
                onClick={handleComplete}
                disabled={isCompleting || isDone}
              >
                {isCompleting ? (
                  <span>···</span>
                ) : isDone ? (
                  <svg
                    className="habit-item__check-icon"
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                  >
                    <circle cx="7" cy="7" r="7" fill="currentColor" />
                    <path
                      d="M4 7.5l2 2 4-4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span>Done</span>
                )}
              </button>

              <button
                type="button"
                className="habit-item__delete-btn"
                onClick={() => deleteHabit(habit.id)}
                disabled={isDeleting}
                aria-label="Delete"
              >
                ✕
              </button>

              <button
                type="button"
                className={`habit-item__expand-btn${expanded ? " habit-item__expand-btn--open" : ""}`}
                onClick={toggle}
                aria-label="Toggle stats"
              >
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                  <path
                    d="M1 1l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && !habit._temp && (
        <div className="habit-item__panel">
          {stat?.loading && <p className="habit-item__panel-msg">Loading…</p>}
          {stat?.error && (
            <p className="habit-item__panel-msg habit-item__panel-msg--err">
              Failed to load stats.
            </p>
          )}
          {stat?.data && (
            <>
              <div className="habit-item__stat-row">
                <div className="habit-item__stat">
                  <span className="habit-item__stat-val">{stat.data.current_streak}</span>
                  <span className="habit-item__stat-lbl">Current streak</span>
                </div>
                <div className="habit-item__stat">
                  <span className="habit-item__stat-val">{stat.data.longest_streak}</span>
                  <span className="habit-item__stat-lbl">Longest</span>
                </div>
                <div className="habit-item__stat">
                  <span className="habit-item__stat-val">{stat.data.completion_percentage}%</span>
                  <span className="habit-item__stat-lbl">Completion</span>
                </div>
              </div>

              <div className="habit-item__days">
                {stat.data.last_7_days.map(({ date, completed }) => (
                  <div
                    key={date}
                    className={`habit-item__day${completed ? " habit-item__day--done" : ""}`}
                  >
                    <span className="habit-item__day-pip" />
                    <span className="habit-item__day-date">{date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export default HabitItem;
