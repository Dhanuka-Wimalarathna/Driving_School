import express from "express";
import { sendNotifications, getNotifications, markAllAsRead, } from "../controllers/notificationController.js"; // ✅ Import it here
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendNotifications);
router.get("/show", authMiddleware, getNotifications);
router.put("/read-all", authMiddleware, markAllAsRead);

export default router;
