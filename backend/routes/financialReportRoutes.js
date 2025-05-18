import express from 'express';
import { generateFinancialReport } from '../controllers/financialReportController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin check middleware
const adminCheck = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Route to generate and download financial reports
router.get('/download', authMiddleware, adminCheck, generateFinancialReport);

export default router; 