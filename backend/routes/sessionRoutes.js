import express from 'express';
import { getStudentProgress } from '../controllers/sessionController.js';

const router = express.Router();
router.get('/student-progress/:id', getStudentProgress);
export default router;
