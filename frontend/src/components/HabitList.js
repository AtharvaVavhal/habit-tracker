import { useHabits } from "../context/HabitContext";
import HabitItem from "./HabitItem";

function HabitList() {
  const { habits } = useHabits();

  if (habits.length === 0) {
    return (
      <div className="habit-empty">
        <p className="habit-empty__title">No habits yet</p>
        <p className="habit-empty__sub">Start by adding your first habit above</p>
      </div>
    );
  }

  return (
    <ul className="habit-list">
      {habits.map((habit) => (
        <HabitItem key={habit.id} habit={habit} />
      ))}
    </ul>
  );
}

export default HabitList;
