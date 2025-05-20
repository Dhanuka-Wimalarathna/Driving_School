import express from 'express';
import { handleSessionCompletion, handleSessionNotCompleted } from '../controllers/progressController.js';

const router = express.Router();

router.post('/mark-completed', handleSessionCompletion);
router.post('/mark-not-completed', handleSessionNotCompleted);

export default router;