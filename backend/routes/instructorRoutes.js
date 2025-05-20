import express from 'express';
import { register, login, getProfile, updateProfile, getAllInstructors, deleteInstructor, updateInstructorById } from '../controllers/instructorController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, getProfile);
router.put('/update', authMiddleware, updateProfile);

// Admin routes (should be protected in production with admin middleware)
router.get('/', getAllInstructors);
router.delete('/:id', deleteInstructor);
router.put('/:id', updateInstructorById);

export default router;