import express from 'express';
import { registerInstructor, loginInstructor, getInstructorProfile } from '../controllers/instructorController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerInstructor);
router.post('/login', loginInstructor);
router.get('/me', authMiddleware('instructor'), getInstructorProfile);

export default router;
