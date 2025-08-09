import {query} from "../models/db.js";

export const getHabits = async (req, res) => {
  const userId = req.user.id;

  try {
    await query(`
      UPDATE habits
      SET current_streak = 0
      WHERE user_id = $1
        AND (
          last_completed IS NULL 
          OR last_completed::date NOT IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day'))`, [userId]);

    const result = await query(
      "SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC",
      [userId]
    );

    res.json(result.rows);

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

export const updateHabit = async (req, res) => {
  const { name, description, goal } = req.body;
  try {
    await query(
      `UPDATE habits
       SET name = $1, description = $2, goal= $3
       WHERE id = $4 AND user_id = $5`,
      [name, description, goal,req.params.id, req.user.id]
    );
    res.status(200).json({ message: "habit updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update habit" });
  }
};

export const markHabitDone = async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;

  try {
    const { rows } = await query(
      `SELECT current_streak, last_completed, goal,
      (last_completed::date = CURRENT_DATE) AS done_today
       FROM habits
       WHERE id = $1 AND user_id = $2`,
      [habitId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const habit = rows[0];

    const formatDate = (date) =>
    date.toISOString().split("T")[0];

    const todayStr = formatDate(new Date());
    const lastDoneDate = habit.last_completed
      ? formatDate(new Date(habit.last_completed))
      : null;
    if (habit.done_today) {
      return res.status(200).json({ message: "Already marked as done today" });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = lastDoneDate === formatDate(yesterday);

    let newStreak = isYesterday
      ? habit.current_streak + 1
      : 1;

    if (newStreak > habit.goal) {
      newStreak = habit.goal;
    }

    const result = await query(
      `UPDATE habits
       SET current_streak = $1, last_completed = $2
       WHERE id = $3 
         AND user_id = $4
         RETURNING current_streak, last_completed, goal`,
      [newStreak, todayStr, habitId, userId]
    );

     if (habit.current_streak >= habit.goal) {
      return res.status(200).json({
        message: "You have already completed your goal!"
      });
    }

    if (newStreak === habit.goal) {
      return res.status(200).json({
        message: "🎉 Congratulations! You have completed your goal!",
        current_streak: newStreak,
        last_completed: todayStr
      });
    }

    res.status(200).json({
      message: "Streak updated",
      current_streak: newStreak,
      last_completed: todayStr
    });

  } catch (err) {
    console.error("Error updating habit:", err);
    res.status(500).json({ error: "Failed to update habit streak" });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const { rows } = await query(
      "DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Habit not found" });
    }

    res.status(200).json({ message: "Habit deleted successfully" });

  } catch (err) {
    console.error("Error deleting habit:", err);
    res.status(500).json({ error: "Failed to delete habit" });
  }
};