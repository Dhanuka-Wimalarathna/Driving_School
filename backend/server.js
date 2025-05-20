import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
// import './cronJobs/cleanupBookings.js'

import sqldb from './config/sqldb.js'; // Import the MySQL connection
import authRoutes from './routes/authRoutes.js';
import forgotPasswordRoutes from './routes/forgotPasswordRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js'; // Assuming instructor routes are in authRoutes
import dashboardRoutes from './routes/dashboardRoutes.js'; // Assuming dashboard routes are in dashboardRoutes
import selectPackageRoutes from './routes/selectPackageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js'; // Assuming notification routes are in notificationRoutes
import bookingRoutes from './routes/bookingRoutes.js'; // Assuming booking routes are in bookingRoutes
import progressRoutes from './routes/progressRoutes.js'; // Assuming progress routes are in progressRoutes
import sessionRoutes from './routes/sessionRoutes.js'; // Assuming session routes are in sessionRoutes
import paymentRoutes from './routes/paymentRoutes.js'; // Assuming payment routes are in paymentRoutes
import instructorDashboardRoutes from './routes/instructorDashboardRoutes.js';
import studentDashboardRoutes from './routes/studentDashboardRoutes.js'; // Assuming student routes are in studentRoutes
import trialRoutes from './routes/trialRoutes.js'; // Assuming trial routes are in trialRoutes
import financialReportRoutes from './routes/financialReportRoutes.js';
import studyMaterialRoutes from './routes/studyMaterialRoutes.js';

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
app.use('/api/instructors', instructorRoutes); // Assuming instructor routes are in authRoutes
app.use('/api/dashboard', dashboardRoutes); // Assuming dashboard routes are in dashboardRoutes
app.use('/api', selectPackageRoutes);
app.use('/api/notifications', notificationRoutes); // Assuming notification routes are in notificationRoutes
app.use('/api/booking', bookingRoutes); // Assuming booking routes are in bookingRoutes
app.use('/api/progress', progressRoutes); // Assuming progress routes are in progressRoutes
app.use('/api/session', sessionRoutes);
app.use('/api', paymentRoutes);
app.use('/api/instructorDashboard', instructorDashboardRoutes);
app.use('/api/studentDashboard', studentDashboardRoutes); // Assuming student routes are in studentRoutes
app.use('/api/trial-exams', trialRoutes); // Assuming trial routes are in trialRoutes
app.use('/api/financial-reports', financialReportRoutes);
app.use('/api/study-materials', studyMaterialRoutes);

// In your server.js, right before the 404 handler:
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
  });

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