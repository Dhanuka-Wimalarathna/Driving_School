import express from 'express';
import {
  getStudentProgressDetails,
  markSessionCompletedCtrl
} from '../controllers/sessionController.js';

const router = express.Router();

router.post('/mark-completed', markSessionCompletedCtrl);
router.get('/progress/:studentId', getStudentProgressDetails);

export default router;