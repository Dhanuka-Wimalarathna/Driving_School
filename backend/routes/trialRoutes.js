import express from 'express';
import {
  createTrialExam,
  getTrialExams,
  updateTrialExamStatus,
  deleteTrialExam,
  getTrialStudentsDetails,
  updateTrialExam,
  getStudentTrialExams  // Add this import
} from '../controllers/trialController.js';
import authMiddleware from '../middleware/authMiddleware.js';  // Import auth middleware

const router = express.Router();

// Explicitly register the route with auth middleware
router.get('/student', authMiddleware, getStudentTrialExams);

// Existing routes
router.post('/accept-trial', createTrialExam);
router.get('/', getTrialExams);
router.put('/:id/status', updateTrialExamStatus);
router.delete('/:id', deleteTrialExam);
router.get('/students-details', getTrialStudentsDetails);
router.put('/update', updateTrialExam);

export default router;