import { useState } from "react";
import { HabitProvider, useHabits } from "./context/HabitContext";
import Stats from "./components/Stats";
import HabitList from "./components/HabitList";
import "./App.css";

function AppInner() {
  const { createHabit, creatingHabit, initialLoading, isRefreshing, error } = useHabits();
  const [name, setName] = useState("");
  const [type, setType] = useState("daily");

  const addHabit = async () => {
    if (!name.trim()) return;
    await createHabit({ name, type });
    setName("");
  };

  if (initialLoading) {
    return <div className="app-loading">Loading…</div>;
  }

  return (
    <div className="app">
      <div className="app__inner">
        <header className="app-header">
          <div className="app-header__top">
            <h1 className="app-title">Habit Tracker</h1>
            <a href="/" className="app-back">← Home</a>
          </div>
          <p className={`app-status${error ? " app-status--error" : ""}`}>
            {error ? error : isRefreshing ? "Updating…" : ""}
          </p>
        </header>

        <Stats />

        <form
          className="habit-form"
          onSubmit={(e) => { e.preventDefault(); addHabit(); }}
        >
          <input
            className="habit-form__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New habit name"
          />
          <div className="type-toggle">
            {["daily", "weekly"].map((t) => (
              <button
                key={t}
                type="button"
                className={`type-toggle__btn${type === t ? " type-toggle__btn--active" : ""}`}
                onClick={() => setType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button type="submit" className="btn btn--primary" disabled={creatingHabit}>
            {creatingHabit ? "…" : "Add"}
          </button>
        </form>

        <HabitList />
      </div>
    </div>
  );
}

function App() {
  return (
    <HabitProvider>
      <AppInner />
    </HabitProvider>
  );
}

export default App;
