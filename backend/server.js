import express from "express";
import session from "express-session";
import passport from "passport";
import env from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import configurePassport from "./config/passport.js";
import { connectDB } from "./models/db.js";

const app = express();
env.config();
const port = process.env.PORT || 5000;
// Call connectDB to establish connection
connectDB(); // Connect to the database



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


app.get("/", (req, res) => {
  res.json({ message: "Welcome to Learnify API" });
});


app.listen(port, () => {
  console.log(`Learnify server running at http://localhost:${port}`);
});