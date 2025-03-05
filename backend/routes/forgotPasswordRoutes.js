import express from 'express';
import { sendOTP, verifyOTP, resetPassword } from '../controllers/forgotPasswordController.js';

const router = express.Router();

// Route to send OTP
router.post('/send-otp', sendOTP);

// Route to verify OTP
router.post('/verify-otp', verifyOTP);

// Route to reset password
router.post('/reset-password', resetPassword);

export default router; // Export the router as default