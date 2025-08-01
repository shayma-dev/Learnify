import {query} from "../models/db.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const signup = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const existing = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const hash = await bcrypt.hash(password, saltRounds);
    const result = await query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *",
      [email, hash, username]
    );
    req.login(result.rows[0], err => {
      if (err) return res.status(500).json({ error: "Login failed after signup" });
      return res.status(201).json({ message: "User registered", user: result.rows[0] });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup error" });
  }
};

export const loginSuccess = (req, res) => {
  res.status(200).json({ message: "Login successful", user: req.user });
};

export const logout = (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: "Logout error" });
    res.status(200).json({ message: "Logged out" });
  });
};
