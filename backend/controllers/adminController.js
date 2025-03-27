import Admin from '../models/admin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Admin Registration Controller
export const registerAdmin = (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email already exists
    Admin.findByEmail(email)
        .then((existingAdmin) => {
            if (existingAdmin) {
                return res.status(400).json({ message: 'Admin already exists' });
            }

            // Create the new admin
            return Admin.create(firstName, lastName, email, password);
        })
        .then((result) => {
            res.status(201).json({ message: 'Admin created successfully' });
        })
        .catch((error) => {
            console.error('Admin registration error:', error);
            res.status(500).json({ message: 'Server error' });
        });
};

// Admin Login Controller
export const loginAdmin = (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the admin by email
    Admin.findByEmail(email)
        .then((admin) => {
            if (!admin) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Compare the password
            if (!Admin.comparePassword(password, admin.password)) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.json({ message: 'Login successful', token });
        })
        .catch((error) => {
            console.error('Admin login error:', error);
            res.status(500).json({ message: 'Server error' });
        });
};
