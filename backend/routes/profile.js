import express from "express";
import * as profileController from "../controllers/profileController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", isAuthenticated, profileController.getProfile);
router.post("/update", isAuthenticated, profileController.updateUsername);
router.post("/avatar", isAuthenticated, upload.single("avatar"), profileController.updateAvatar);
router.post("/subjects/add", isAuthenticated, profileController.addSubject);
router.post("/subjects/delete/:id", isAuthenticated, profileController.deleteSubject);

export default router;