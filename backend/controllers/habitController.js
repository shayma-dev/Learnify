import {query} from "../models/db.js";

export const getHabits = async (req, res) => {
  const userId = req.user.id;

  try {
    await query(`
      UPDATE habits
      SET current_streak = 0
      WHERE user_id = $1
      AND current_streak < goal
        AND (
          last_completed IS NULL 
          OR last_completed::date NOT IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day'))`, [userId]);

    const result = await query(
  `SELECT id, user_id, name, description, goal, current_streak,
   to_char(last_completed, 'YYYY-MM-DD') AS last_completed
   FROM habits
   WHERE user_id = $1
   ORDER BY id ASC`,
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
    const result = await query(
      `INSERT INTO habits (user_id, name, description, goal, current_streak, last_completed)
       VALUES ($1, $2, $3, $4, 0, null) RETURNING *`,
      [req.user.id, name, description, goal]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving habit:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateHabit = async (req, res) => {
  const { name, description, goal } = req.body;
  try {
    const { rows }= await query(
      `UPDATE habits
       SET name = $1, description = $2, goal= $3
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [name, description, goal,req.params.id, req.user.id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Habit not found" });
      }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update habit" });
  }
};

export const markHabitDone = async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;
  try {

        const { rows: beforeRows } = await query(
      `SELECT current_streak, goal, last_completed FROM habits WHERE id = $1 AND user_id = $2`,
      [habitId, userId]
    );
    if (beforeRows.length === 0) {
      return res.status(404).json({ error: "Habit not found" });
    }
    const beforeStreak = beforeRows[0].current_streak;
    const goal = beforeRows[0].goal;

     if (beforeStreak >= goal) {
        return res.status(200).json({
          message: "You already reached your goal!"
        });
      }

    const { rows } = await query(
      `UPDATE habits
       SET
         current_streak = CASE
           WHEN last_completed::date = CURRENT_DATE - INTERVAL '1 day'
             THEN LEAST(current_streak + 1, goal)
           ELSE 1
         END,
         last_completed = CURRENT_TIMESTAMP
       WHERE id = $1
         AND user_id = $2
         AND (last_completed IS NULL OR last_completed::date <> CURRENT_DATE)
       RETURNING current_streak, last_completed, goal`,
      [habitId, userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Already marked as done today"
      });
    }
    const updated = rows[0];

    if (beforeStreak < goal && updated.current_streak === updated.goal) {
      return res.status(200).json({
        message: "🎉 Congratulations! You have completed your goal!",
        current_streak: updated.current_streak,
        last_completed: updated.last_completed,
        goal: updated.goal });
    }

    return res.status(200).json({
      message: "Streak updated",
      current_streak: updated.current_streak,
      last_completed: updated.last_completed,
      goal: updated.goal
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