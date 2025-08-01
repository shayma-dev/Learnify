import {query} from "../models/db.js";

export const createFocusSession = async (req, res) => {
  const { subjectId, duration, breakTime } = req.body;
  try {
    await query(
      `INSERT INTO sessions (user_id, subject_id, duration_minutes, break_minutes)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, subjectId, duration, breakTime]
    );
    res.status(201).json({ message: "Session saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving session" });
  }
};

export const getSessionSummary = async (req, res) => {
  try {
    const subjects = await query(
      "SELECT * FROM subjects WHERE user_id = $1",
      [req.user.id]
    );

    const todaySessions = await query(
      `SELECT s.name, SUM(se.duration_minutes) as duration
       FROM sessions se
       JOIN subjects s ON s.id = se.subject_id
       WHERE se.user_id = $1 AND DATE(se.created_at) = CURRENT_DATE
       GROUP BY s.name`,
      [req.user.id]
    );

    const totalFocus = await query(
      "SELECT SUM(duration_minutes) FROM sessions WHERE user_id = $1",
      [req.user.id]
    );

    const todayTotal = todaySessions.rows.reduce((sum, row) => sum + parseInt(row.duration), 0);

    res.json({
      subjects: subjects.rows,
      todaySessions: todaySessions.rows,
      totalFocus: totalFocus.rows[0].sum || 0,
      todayTotal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading focus data" });
  }
};
