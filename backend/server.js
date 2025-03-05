import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import crypto from 'crypto';
import fs from 'fs';

import sqldb from './config/sqldb.js'; // Import the MySQL connection
import authRoutes from './routes/authRoutes.js'; // Import the auth routes
import forgotPasswordRoutes from './routes/forgotPasswordRoutes.js'; // Import the forgot password routes

dotenv.config(); // Load environment variables

// Function to generate a random secret key
const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

// Generate and set the JWT_SECRET dynamically for this session
process.env.JWT_SECRET = generateSecretKey();  // Set the JWT secret for the current session

// Optionally, save the generated secret to .env file (not recommended for production)
fs.appendFileSync('.env', `\nJWT_SECRET=${process.env.JWT_SECRET}`, 'utf8');

// Print generated JWT secret (optional)
console.log('Generated JWT Secret:', process.env.JWT_SECRET);

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

// Test route
app.get('/', (req, res) => {
    res.send('Welcome to Madushani Driving School API!');
});

// Auth routes
app.use('/api/auth', authRoutes);

// Forgot password routes
app.use('/api/forgot-password', forgotPasswordRoutes); // Changed the path to avoid conflict with auth

// Set the port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
