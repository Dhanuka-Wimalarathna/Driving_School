import express from 'express';
import { createBooking, getInstructorSchedule, getStudentBookings } from '../controllers/bookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/book', authMiddleware, createBooking);
router.get('/schedule/:instructorId', getInstructorSchedule);
router.get('/student', authMiddleware, getStudentBookings);


export default router;