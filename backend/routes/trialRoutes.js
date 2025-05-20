import express from 'express';
import {  createTrialExam,  getTrialExams,  updateTrialExamStatus,  updateTrialExamStatusAndResult,  deleteTrialExam,  getTrialStudentsDetails,  updateTrialExam,  getStudentTrialExams,  fetchAllTrialStudents} from '../controllers/trialController.js';
import authMiddleware from '../middleware/authMiddleware.js';  // Import auth middleware

const router = express.Router();

// Explicitly register the route with auth middleware
router.get('/student', authMiddleware, getStudentTrialExams);

// Existing routes
router.post('/accept-trial', createTrialExam);
router.get('/', getTrialExams);
router.put('/:id/status', updateTrialExamStatus);
router.put('/:id/status-result', updateTrialExamStatusAndResult); // New endpoint for status and result update
router.delete('/:id', deleteTrialExam);
router.get('/students-details', getTrialStudentsDetails);
router.put('/update', updateTrialExam);
router.get('/student/:studentId', getStudentTrialExams);
router.get('/all-students', fetchAllTrialStudents);

export default router;