import express from "express";
import session from "express-session";
import passport from "passport";
import env from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import plannerRoutes from "./routes/planner.js";
import sessionRoutes from "./routes/sessions.js";
import noteRoutes from "./routes/notes.js";
import habitRoutes from "./routes/habits.js";
import profileRoutes from "./routes/profile.js";

import configurePassport from "./config/passport.js";

const app = express();
env.config();
const port = process.env.PG_PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin:'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/profile", profileRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Welcome to Learnify API" });
});


app.listen(port, () => {
  console.log(`Learnify server running at http://localhost:${port}`);
});