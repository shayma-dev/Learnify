import express from "express";
import passport from "passport";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", passport.authenticate("local", {
  failureRedirect: "/api/auth/login-failure",
}), authController.loginSuccess);

router.get("/login-failure", (req, res) => {
  res.status(401).json({ error: "Invalid email or password" });
});


// Google OAuth
/*router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/learnify", passport.authenticate("google", {
  failureRedirect: "/api/auth/login-failure"
}), authController.loginSuccess);*/

export default router;