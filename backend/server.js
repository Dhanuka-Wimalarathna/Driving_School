import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import sqldb from './config/sqldb.js'; // Import the MySQL connection
import authRoutes from './routes/authRoutes.js';
import forgotPasswordRoutes from './routes/forgotPasswordRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config(); // Load environment variables

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging middleware
app.use(express.json()); // JSON body parser

// Test route (to check if the API is running)
app.get('/', (req, res) => {
    res.send('🚗 Welcome to Madushani Driving School API!');
});

// MySQL connection with proper error handling
sqldb.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
        process.exit(1); // Exit the application if DB connection fails
    }
    console.log('✅ Connected to the database');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admins', adminRoutes);

// Handle 404 errors for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('🔥 Server error:', err);
    res.status(500).json({ message: '🔥 Internal Server Error' });
});

// Set the port
const PORT = process.env.PORT || 8081;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('🛑 Server is shutting down...');
    sqldb.end((err) => {
        if (err) {
            console.error('❌ Error closing database connection:', err.stack);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});
