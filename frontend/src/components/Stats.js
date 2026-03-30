import { useHabits } from "../context/HabitContext";

function Stats() {
  const { globalStats: stats } = useHabits();

  if (!stats) return null;

  const maxCompleted = Math.max(...stats.last_7_days.map((d) => d.completed), 1);

  return (
    <section className="stats-card">
      <h2 className="stats-card__title">Overview</h2>

      <div className="stats-card__numbers">
        <div className="stats-card__stat">
          <span className="stats-card__value">{stats.streak}</span>
          <span className="stats-card__label">Day streak</span>
        </div>
        <div className="stats-card__stat">
          <span className="stats-card__value">{stats.completion_rate}%</span>
          <span className="stats-card__label">Completion</span>
        </div>
      </div>

      <div className="stats-card__chart-label">Last 7 days</div>
      <div className="stats-card__chart">
        {stats.last_7_days.map((day) => (
          <div key={day.date} className="stats-card__bar-col">
            <div
              className={`stats-card__bar ${day.completed > 0 ? "stats-card__bar--active" : "stats-card__bar--empty"}`}
              style={{ height: `${day.completed ? (day.completed / maxCompleted) * 52 + 12 : 3}px` }}
            />
            <span className="stats-card__bar-date">{day.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;
