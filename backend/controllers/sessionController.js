import {query} from "../models/db.js";

// Same helper pattern as Habits
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
  // Fallback: UTC date string
  return new Date().toISOString().slice(0, 10);
}

export const getSessionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const localDate = localDateFromReq(req);

    const subjects = await query(
      "SELECT * FROM subjects WHERE user_id = $1",
      [userId]
    );

    // Today (timezone-aware via localDate)
    const todaySessions = await query(
      `SELECT s.name, SUM(se.duration_minutes) as duration
       FROM sessions se
       JOIN subjects s ON s.id = se.subject_id
       WHERE se.user_id = $1
         AND se.created_at::date = $2::date
       GROUP BY s.name`,
      [userId, localDate]
    );

    // Per-subject total focus (all time) — unchanged shape
    const totalFocus = await query(
      `SELECT s.name AS subject_name, SUM(se.duration_minutes) AS total_focus
       FROM sessions se
       JOIN subjects s ON s.id = se.subject_id
       WHERE se.user_id = $1
       GROUP BY s.name
       ORDER BY s.name`,
      [userId]
    );

    const todayTotal = todaySessions.rows.reduce(
      (sum, row) => sum + parseInt(row.duration, 10),
      0
    );

    const todaySessionsCount = await query(
      `SELECT COUNT(*) FROM sessions
       WHERE user_id = $1
         AND created_at::date = $2::date`,
      [userId, localDate]
    );

    res.json({
      subjects: subjects.rows,
      todaySessions: todaySessions.rows,          // durations may be strings (kept)
      totalFocus: totalFocus.rows,                // [{ subject_name, total_focus }]
      todayTotal,
      todaySessionsCount: parseInt(todaySessionsCount.rows[0].count, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading focus data" });
  }
};

export const createFocusSession = async (req, res) => {
  const { subject_id, duration } = req.body;

  // Minimal addition: enforce 1..720 minutes
  const d = parseInt(duration, 10);
  if (!Number.isInteger(d) || d < 1 || d > 720) {
    return res
      .status(400)
      .json({ error: "duration must not excceed 12 hours" });
  }

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
      [req.user.id, subject_id, d]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving session" });
  }
};