import express from 'express';
import { registerUser, loginUser, getUserDetails, updateProfile } from '../controllers/authControllers.js';
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

export default router;
