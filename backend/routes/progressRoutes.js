import express from 'express';
import { handleSessionCompletion } from '../controllers/progressController.js';

const router = express.Router();

router.post('/mark-completed', handleSessionCompletion);

export default router;