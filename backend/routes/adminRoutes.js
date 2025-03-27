import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/adminController.js';

const router = express.Router();

// Admin registration route
router.post('/register', registerAdmin);

// Admin login route
router.post('/login', loginAdmin);

export default router;
