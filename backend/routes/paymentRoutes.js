import express from 'express';
import { handleCreatePayment, handleGetPayments } from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Corrected routes
router.post('/payments/make-payment', authMiddleware, handleCreatePayment);
router.get('/payments', authMiddleware, handleGetPayments);

export default router;