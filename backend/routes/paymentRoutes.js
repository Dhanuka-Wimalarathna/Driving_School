import express from 'express';
import { 
  handleCreatePayment, 
  handleGetPayments, 
  handleApprovePayment,
  handleGetPendingPayments,
  handleRejectPayment
} from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Inline admin check middleware
const adminCheck = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

router.post('/payments/make-payment', authMiddleware, handleCreatePayment);
router.get('/payments', authMiddleware, handleGetPayments);
router.get('/payments/pending', authMiddleware, adminCheck, handleGetPendingPayments);
router.put('/payments/:paymentId/approve', authMiddleware, adminCheck, handleApprovePayment);
router.put('/payments/:paymentId/reject', authMiddleware, adminCheck, handleRejectPayment);

export default router;
