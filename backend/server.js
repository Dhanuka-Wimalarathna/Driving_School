import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import sqldb from './config/sqldb.js'; // Import the MySQL connection
import authRoutes from './routes/authRoutes.js'; // Import the auth routes
import forgotPasswordRoutes from './routes/forgotPasswordRoutes.js'; // Import the forgot password routes
import packageRoutes from './routes/packageRoutes.js'; // Import the package routes
import vehicleRoutes from './routes/vehicleRoutes.js'; // Import the vehicle routes
import studentRoutes from './routes/studentRoutes.js'; // Import the student routes

dotenv.config(); // Load environment variables

// Create express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging middleware
app.use(express.json()); // JSON body parser

// MySQL connection
sqldb.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        process.exit(1); // Exit the application if DB connection fails
    }
    console.log('Connected to the database');
});

// Test route (can be used to verify server is working)
app.get('/', (req, res) => {
    res.send('Welcome to Madushani Driving School API!');
});

// Auth routes (login/signup, etc.)
app.use('/api/auth', authRoutes);

// Forgot password routes
app.use('/api/forgot-password', forgotPasswordRoutes);

// Package and Vehicle routes
app.use('/api/packages', packageRoutes); // Handle package-related requests
app.use('/api/vehicles', vehicleRoutes); // Handle vehicle-related requests

// Student routes
app.use("/api/students", studentRoutes); // Handle student-related requests");

// Set the port
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
