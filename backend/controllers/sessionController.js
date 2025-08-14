import {query} from "../models/db.js";

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

    const todaySessionsCount = await query(`
    SELECT COUNT(*) FROM sessions
    WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE`, [req.user.id]);

    res.json({
      subjects: subjects.rows,
      todaySessions: todaySessions.rows,
      totalFocus: totalFocus.rows[0].sum || 0,
      todayTotal ,
      todaySessionsCount: parseInt(todaySessionsCount.rows[0].count) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading focus data" });
  }
};

export const createFocusSession = async (req, res) => {
  const {subject_id, duration} = req.body;
     const subjectCheck = await query(
      "SELECT id FROM subjects WHERE id = $1 AND user_id = $2",
      [subject_id, req.user.id]
    );
    if (subjectCheck.rows.length === 0) {
      return res.status(400).json({ error: "subject not found" });
    }
  try {
    const result = await query(
      `INSERT INTO sessions (user_id, subject_id, duration_minutes)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, subject_id, duration]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving session" });
  }
};


