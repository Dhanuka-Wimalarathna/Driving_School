import express from 'express';
import { registerUser, loginUser, getUserDetails  } from '../controllers/authControllers.js';

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser); 

// Get logged-in user details
router.get('/user', getUserDetails);
export default router;
