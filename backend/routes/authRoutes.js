import express from 'express';
import { registerUser, loginUser, getUserDetails, updateProfile, deleteUser, sendOTP, verifyOTP, resetPassword } from '../controllers/authControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// User registration
router.post('/register', registerUser);

// User login
router.post('/login', loginUser);

// Get user details (Protected route)
router.get('/user', authMiddleware, getUserDetails);

// Update user profile (Protected route)
router.put('/update', authMiddleware, updateProfile);

// Delete user account (Protected route)
router.delete('/user/delete', authMiddleware, deleteUser);

// Send OTP for password reset
router.post('/send-otp', sendOTP);

// Verify OTP for password reset
router.post('/verify-otp', verifyOTP);

// Reset password after verification
router.post('/reset-password', resetPassword);

export default router;
