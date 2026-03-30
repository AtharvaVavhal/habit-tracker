import { useHabits } from "../context/HabitContext";
import HabitItem from "./HabitItem";

function HabitList() {
  const { habits } = useHabits();

  return (
    <ul className="habit-list">
      {habits.map((habit) => (
        <HabitItem key={habit.id} habit={habit} />
      ))}
    </ul>
  );
}

export default HabitList;
