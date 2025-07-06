import express from 'express';
import { createBooking, getInstructorSchedule, getStudentBookings, getStudentBookingsByDate } from '../controllers/bookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/book', authMiddleware, createBooking);
router.get('/schedule/:instructorId', getInstructorSchedule);
router.get('/student', authMiddleware, getStudentBookings);
router.get('/student-bookings', authMiddleware, getStudentBookingsByDate);

export default router;