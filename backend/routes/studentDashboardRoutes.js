import express from 'express';
import { getStudentDashboardData } from '../controllers/studentDashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getStudentDashboardData);

export default router;
