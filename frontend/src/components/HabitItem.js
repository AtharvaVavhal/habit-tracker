import { useState } from "react";
import { getHabitStats } from "../api";
import { useHabits } from "../context/HabitContext";

function HabitItem({ habit }) {
  const { completeHabit, deleteHabit, pendingIds } = useHabits();
  const isPending = pendingIds.has(habit.id);
  const [expanded, setExpanded] = useState(false);
  const [stat, setStat] = useState(null); // { loading, data, error } | null

  const fetchStat = () => {
    setStat({ loading: true, data: null, error: false });
    getHabitStats(habit.id)
      .then((data) => setStat({ loading: false, data, error: false }))
      .catch(() => setStat({ loading: false, data: null, error: true }));
  };

  const toggle = () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!stat?.data && !stat?.loading) fetchStat();
  };

  const handleComplete = () => {
    completeHabit(habit.id).then(() => {
      if (expanded) fetchStat();
      else setStat(null);
    });
  };

  return (
    <li className="habit-card">
      <div className="habit-card__header">
        <div className="habit-card__toggle" onClick={toggle}>
          <span className="habit-card__name">{habit.name}</span>
          <div className="habit-card__meta">
            <span className="habit-card__badge">{habit.type}</span>
            <span className="habit-card__chevron">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
        <div className="habit-card__actions">
          <button
            className="btn btn--done"
            onClick={handleComplete}
            disabled={isPending}
          >
            {isPending ? "..." : "✓ Done"}
          </button>
          <button
            className="btn btn--delete"
            onClick={() => deleteHabit(habit.id)}
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="habit-stats">
          {stat?.loading && <p className="habit-stats__message">Loading...</p>}
          {stat?.error && <p className="habit-stats__message">Failed to load stats.</p>}
          {stat?.data && (
            <>
              <div className="habit-stats__grid">
                <div className="habit-stats__stat">
                  <span className="habit-stats__value">{stat.data.current_streak}</span>
                  <span className="habit-stats__label">Current streak</span>
                </div>
                <div className="habit-stats__stat">
                  <span className="habit-stats__value">{stat.data.longest_streak}</span>
                  <span className="habit-stats__label">Longest streak</span>
                </div>
                <div className="habit-stats__stat">
                  <span className="habit-stats__value">{stat.data.completion_percentage}%</span>
                  <span className="habit-stats__label">Completion</span>
                </div>
              </div>
              <div className="habit-stats__days-title">Last 7 days</div>
              <ul className="habit-stats__days">
                {stat.data.last_7_days.map(({ date, completed }) => (
                  <li key={date} className="habit-stats__day">
                    <span className={`habit-stats__day-dot ${completed ? "habit-stats__day-dot--done" : "habit-stats__day-dot--missed"}`}>
                      {completed ? "●" : "○"}
                    </span>
                    {date}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export default HabitItem;
