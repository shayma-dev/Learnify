import {query} from "../models/db.js";

export const getNotes = async (req, res) => {
  try {
    const [subjects, notes] = await Promise.all([
      query("SELECT * FROM subjects WHERE user_id = $1", [req.user.id]),
      query(`
        SELECT notes.*, subjects.name AS subject_name 
        FROM notes 
        LEFT JOIN subjects ON notes.subject_id = subjects.id
        WHERE notes.user_id = $1
        ORDER BY notes.created_at DESC
      `, [req.user.id])
    ]);

    res.json({ subjects: subjects.rows, notes: notes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const createNote = async (req, res) => {
  const { title, content, subject } = req.body;
  try {
    await query(
      'INSERT INTO notes (title, content, subject_id, user_id) VALUES ($1, $2, $3, $4)',
      [title, content, subject, req.user.id]
    );
    res.status(201).json({ message: "Note created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating note" });
  }
};

export const updateNote = async (req, res) => {
  const { title, content, subject } = req.body;
  try {
    await query(
      `UPDATE notes SET title = $1, content = $2, subject_id = $3 
       WHERE id = $4 AND user_id = $5`,
      [title, content, subject, req.params.id, req.user.id]
    );
    res.status(200).json({ message: "Note updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    await query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting note" });
  }
};
