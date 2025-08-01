import {query} from "../models/db.js";

export const getProfile = async (req, res) => {
  try {
    const subjects = await query("SELECT * FROM subjects WHERE user_id = $1", [req.user.id]);
    res.json({ user: req.user, subjects: subjects.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading profile" });
  }
};

export const updateUsername = async (req, res) => {
  const { username } = req.body;
  try {
    await query("UPDATE users SET username = $1 WHERE id = $2", [username, req.user.id]);
    req.user.username = username;
    res.status(200).json({ success: true, message: "Username updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating username" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    let avatarUrl;
    if (req.file && req.file.filename) {
      avatarUrl = `/uploads/${req.file.filename}`;
    } else {
      const result = await query("SELECT avatar_url FROM users WHERE id = $1", [req.user.id]);
      avatarUrl = result.rows[0]?.avatar_url || "/image/avatar.jpg";
    }
    await query("UPDATE users SET avatar_url = $1 WHERE id = $2", [avatarUrl, req.user.id]);
    res.status(200).json({ message: "Avatar updated", avatar_url: avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating avatar" });
  }
};

export const addSubject = async (req, res) => {
  const { name } = req.body;
  try {
    await query("INSERT INTO subjects (name, user_id) VALUES ($1, $2) RETURNING id", [name, req.user.id]);
    res.status(201).json({ message: "Subject added", id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding subject" });
  }
};

export const deleteSubject = async (req, res) => {
  const subjectId = req.params.id;
  try {
    await query("DELETE FROM subjects WHERE id = $1 AND user_id = $2", [subjectId, req.user.id]);
    res.status(200).json({ message: "Subject deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting subject" });
  }
};
