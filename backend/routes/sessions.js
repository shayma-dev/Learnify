import express from "express";
import * as sessionController from "../controllers/sessionController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, sessionController.createFocusSession);
router.get("/summary", isAuthenticated, sessionController.getSessionSummary);

export default router;