import express from "express";
import { getDashboardStats, getPaymentStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get('/payment-stats', getPaymentStats);

export default router;
