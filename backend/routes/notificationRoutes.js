import express from "express";
import { sendNotifications, getNotifications } from "../controllers/notificationController.js"; // ✅ Import it here
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendNotifications);
router.get("/show", authMiddleware, getNotifications); // ✅ Now this will work

export default router;
