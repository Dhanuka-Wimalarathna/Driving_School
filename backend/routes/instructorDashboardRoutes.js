import express from 'express';
import { getDashboardData } from '../controllers/instructorDashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getDashboardData);

export default router;