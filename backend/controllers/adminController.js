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
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find the admin by email
        const admin = await Admin.findByEmail(email);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the password
        const isMatch = await Admin.comparePassword(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin.id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        // Return success response
        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                firstName: admin.first_name,
                lastName: admin.last_name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};