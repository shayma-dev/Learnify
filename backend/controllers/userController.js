import {query} from "../models/db.js";

export const getTasks = async (req, res) => {
  try {
    const tasks = await query(
      `SELECT tasks.*, subjects.name AS subject_name
       FROM tasks JOIN subjects ON tasks.subject_id = subjects.id
       WHERE tasks.user_id = $1 ORDER BY due_date ASC`,
      [req.user.id]
    );
    res.json(tasks.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading tasks" });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const result = await query(
      `SELECT tasks.*, subjects.name AS subject_name
       FROM tasks JOIN subjects ON tasks.subject_id = subjects.id
       WHERE tasks.id = $1 AND tasks.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching task" });
  }
};

export const createTask = async (req, res) => {
  const { title, description, subject_id, due_date } = req.body;
  try {
    const result = await query(
      `INSERT INTO tasks (user_id, title, description, subject_id, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, title, description, subject_id, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding task" });
  }
};

export const updateTask = async (req, res) => {
  const { title, description, due_date, subject_id } = req.body;
  try {
    await query(
      `UPDATE tasks SET title = $1, description = $2, due_date = $3, subject_id = $4
       WHERE id = $5 AND user_id = $6`,
      [title, description, due_date, subject_id, req.params.id, req.user.id]
    );
    res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found or not yours" });
    }
    res.json({ success: true, deletedTask: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting task" });
  }
};

export const toggleTask = async (req, res) => {
  try {
    const result = await query(
      `UPDATE tasks SET is_completed = NOT is_completed
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error toggling task" });
  }
};
