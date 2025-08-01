import {query} from "../models/db.js";

export const getHabits = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await query("SELECT * FROM habits WHERE user_id = $1", [userId]);
    const habits = result.rows;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    for (const habit of habits) {
      const lastCompleted = habit.last_completed ? habit.last_completed.toISOString().split("T")[0] : null;
      if (lastCompleted !== yesterdayStr && lastCompleted !== today.toISOString().split("T")[0]) {
        await query("UPDATE habits SET current_streak = 0 WHERE id = $1", [habit.id]);
        habit.current_streak = 0;
      }
    }

    res.json(habits);
  } catch (err) {
    console.error("Error loading habits:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createHabit = async (req, res) => {
  const { name, description, goal } = req.body;
  try {
    await query(
      `INSERT INTO habits (user_id, name, description, goal, current_streak, last_completed)
       VALUES ($1, $2, $3, $4, 0, null)`,
      [req.user.id, name, description, goal]
    );
    res.status(201).json({ message: "Habit created" });
  } catch (err) {
    console.error("Error saving habit:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markHabitDone = async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;
  try {
    const habit = await query(
      "SELECT current_streak, goal, last_completed FROM habits WHERE id = $1 AND user_id = $2",
      [habitId, userId]
    );
    if (habit.rows.length === 0) return res.status(404).json({ error: "Habit not found" });

    const today = new Date().toISOString().split("T")[0];
    const lastDone = habit.rows[0].last_completed;
    const lastDoneDate = lastDone ? new Date(lastDone).toISOString().split("T")[0] : null;

    if (lastDoneDate === today) return res.status(200).json({ message: "Already marked as done today" });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = lastDoneDate === yesterday.toISOString().split("T")[0];
    let newStreak = isYesterday ? habit.rows[0].current_streak + 1 : 1;

    await query(
      "UPDATE habits SET current_streak = $1, last_completed = $2 WHERE id = $3 AND user_id = $4",
      [newStreak, today, habitId, userId]
    );

    res.status(200).json({ message: "Streak updated", current_streak: newStreak });
  } catch (err) {
    console.error("Error updating habit:", err);
    res.status(500).json({ error: "Failed to update habit streak" });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    await query("DELETE FROM habits WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    res.status(200).json({ message: "Habit deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete habit" });
  }
};
