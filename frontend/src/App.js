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

  if (initialLoading) return <p className="app-status">Loading...</p>;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Habit Tracker</h1>
        <p className={`app-status ${error ? "app-status--error" : ""}`}>
          {error ? error : isRefreshing ? "Updating..." : ""}
        </p>
      </header>

      <Stats />

      <form
        className="habit-form"
        onSubmit={(e) => { e.preventDefault(); addHabit(); }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit name"
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button type="submit" className="btn btn--primary" disabled={creatingHabit}>
          {creatingHabit ? "..." : "Add"}
        </button>
      </form>

      <HabitList />
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
