import "./LandingPage.css";

const APP_URL = "/app";

function LandingPage() {
  return (
    <div className="landing">
      <main className="landing__content">
        <section className="landing__hero">
          <h1 className="landing__title">Habit Tracker</h1>
          <p className="landing__description">
            A simple tool to build daily and weekly habits, track your streaks,
            and see your progress over time.
          </p>
          <a href={APP_URL} className="landing__cta">
            Open App
          </a>
        </section>

        <section className="landing__features">
          <h2 className="landing__features-title">What it does</h2>
          <ul className="landing__feature-list">
            <li>Track daily and weekly habits with per-habit streak and completion stats</li>
            <li>See a 7-day completion chart and overall completion rate at a glance</li>
            <li>Instant UI updates when marking habits done — no waiting for the server</li>
            <li>All data persisted — your habits and history survive page reloads</li>
          </ul>
        </section>
      </main>

      <footer className="landing__footer">
        Built with Flask + React
      </footer>
    </div>
  );
}

export default LandingPage;
