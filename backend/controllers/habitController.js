import {query} from "../models/db.js";

function localDateFromReq(req) {
  const tz = req.query?.tz || req.headers["x-timezone"] || req.body?.tz;
  try {
    if (tz) {
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return fmt.format(new Date()); // "YYYY-MM-DD"
    }
  } catch (e) {
    console.warn("Invalid timezone:", tz, e?.message);
  }
  return new Date().toISOString().slice(0, 10); // fallback
}

export const getHabits = async (req, res) => {
  const userId = req.user.id;
  const localDate = localDateFromReq(req); // e.g., "2025-08-13"

  try {
    await query(
      `
      UPDATE habits
      SET current_streak = 0
      WHERE user_id = $1
        AND current_streak < goal
        AND (
          last_completed IS NULL
          OR last_completed::date NOT IN ($2::date, ($2::date - INTERVAL '1 day'))
        )
      `,
      [userId, localDate]
    );

    const result = await query(
      `
      SELECT id, user_id, name, description, goal, current_streak, last_completed
      FROM habits
      WHERE user_id = $1
      ORDER BY id ASC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error loading habits:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createHabit = async (req, res) => {
  let { name, description, goal } = req.body;

  // Normalize
  name = (name ?? "").trim();
  description = (description ?? "").trim();
  goal = Number(goal);

  // Validation
  if (name.length < 2 || name.length > 60) {
    return res.status(400).json({ error: "name must be between 2 and 60 characters" });
  }
  if (description.length > 300) {
    return res.status(400).json({ error: "description must be at most 300 characters" });
  }
  if (!Number.isInteger(goal) || goal < 1 || goal > 365) {
    return res.status(400).json({ error: "goal must be an integer between 1 and 365" });
  }

  try {
    const result = await query(
      `
      INSERT INTO habits (user_id, name, description, goal, current_streak, last_completed)
      VALUES ($1, $2, $3, $4, 0, null)
      RETURNING *
      `,
      [req.user.id, name, description || null, goal]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error saving habit:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateHabit = async (req, res) => {
  let { name, description, goal } = req.body;

  name = (name ?? "").trim();
  description = (description ?? "").trim();
  goal = Number(goal);

  if (name.length < 2 || name.length > 60) {
    return res.status(400).json({ error: "name must be between 2 and 60 characters" });
  }
  if (description.length > 300) {
    return res.status(400).json({ error: "description must be at most 300 characters" });
  }
  if (!Number.isInteger(goal) || goal < 1 || goal > 365) {
    return res.status(400).json({ error: "goal must be an integer between 1 and 365" });
  }

  try {
    const { rows } = await query(
      `
      UPDATE habits
      SET name = $1, description = $2, goal = $3
      WHERE id = $4 AND user_id = $5
      RETURNING *
      `,
      [name, description || null, goal, req.params.id, req.user.id]
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
  const localDate = localDateFromReq(req); // "YYYY-MM-DD"

  try {
    const { rows: beforeRows } = await query(
      `SELECT current_streak, goal, last_completed
       FROM habits WHERE id = $1 AND user_id = $2`,
      [habitId, userId]
    );
    if (beforeRows.length === 0) {
      return res.status(404).json({ error: "Habit not found" });
    }
    const beforeStreak = beforeRows[0].current_streak;
    const goal = beforeRows[0].goal;

    if (beforeStreak >= goal) {
      return res.status(200).json({ message: "You already reached your goal!" });
    }

    const { rows } = await query(
      `
      UPDATE habits
      SET
        current_streak = CASE
          WHEN last_completed::date = ($3::date - INTERVAL '1 day')
            THEN LEAST(current_streak + 1, goal)
          ELSE 1
        END,
        last_completed = $3::date
      WHERE id = $1
        AND user_id = $2
        AND (last_completed IS NULL OR last_completed::date <> $3::date)
      RETURNING current_streak, last_completed, goal
      `,
      [habitId, userId, localDate]
    );

    if (rows.length === 0) {
      return res.status(200).json({ message: "Already marked as done today" });
    }

    const updated = rows[0];

    if (beforeStreak < goal && updated.current_streak === updated.goal) {
      return res.status(200).json({
        message: "🎉 Congratulations! You have completed your goal!",
        current_streak: updated.current_streak,
        last_completed: updated.last_completed,
        goal: updated.goal,
      });
    }

    return res.status(200).json({
      message: "Streak updated",
      current_streak: updated.current_streak,
      last_completed: updated.last_completed,
      goal: updated.goal,
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