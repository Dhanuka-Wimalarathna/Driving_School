import express from 'express';
import {
  createTrialExam,
  getTrialExams,
  updateTrialExamStatus,
  deleteTrialExam,
  getTrialStudentsDetails,
  updateTrialExam
} from '../controllers/trialController.js';

const router = express.Router();

// Add this new route for accepting trials
router.post('/accept-trial', createTrialExam);
router.get('/', getTrialExams);
router.put('/:id/status', updateTrialExamStatus);
router.delete('/:id', deleteTrialExam);
router.get('/students-details', getTrialStudentsDetails);
// Add this new route for updating trial exams
router.put('/update', updateTrialExam);

export default router;