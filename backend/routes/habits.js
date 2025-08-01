import express from "express";
import * as habitController from "../controllers/habitController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, habitController.getHabits);
router.post("/", isAuthenticated, habitController.createHabit);
router.post("/:id/done", isAuthenticated, habitController.markHabitDone);
router.delete("/:id", isAuthenticated, habitController.deleteHabit);

export default router;