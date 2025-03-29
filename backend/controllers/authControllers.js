import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqldb from '../config/sqldb.js';  // Using regular MySQL2 (Callback-based)
import dotenv from 'dotenv';

dotenv.config();

// User Registration Controller
export const registerUser = async (req, res) => {
    console.log('Request Body:', req.body);
    const { firstName, lastName, email, nic, birthday, address, phone, password, confirmPassword } = req.body;
  
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match!' });
    }

    try {
        // Check if email, NIC, or phone already exists
        sqldb.query('SELECT * FROM student WHERE EMAIL = ? OR NIC = ? OR PHONE = ?', 
        [email, nic, phone], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email, NIC, or phone already registered' });
            }

            // Hash the password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Password hashing error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                console.log('Inserting user:', { firstName, lastName, email, nic, birthday, address, phone, hashedPassword });

                // Insert new user into database
                sqldb.query(
                    'INSERT INTO student (FIRST_NAME, LAST_NAME, EMAIL, NIC, BIRTHDAY, ADDRESS, PHONE, PASSWORD) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [firstName, lastName, email, nic, birthday, address, phone, hashedPassword],
                    (err, result) => {
                        if (err) {
                            console.error('Database insertion error:', err);
                            return res.status(500).json({ message: 'Server error' });
                        }
                        res.status(201).json({ message: 'User registered successfully' });
                    }
                );
            });
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// User Login Controller
export const loginUser = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    try {
        // Check if user exists
        sqldb.query('SELECT * FROM student WHERE EMAIL = ?', [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: 'User not found' });
            }

            const user = results[0];

            // Compare passwords
            bcrypt.compare(password, user.PASSWORD, (err, isMatch) => {
                if (err) {
                    console.error('Password comparison error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                // Generate JWT Token with STU_ID
                const token = jwt.sign({ id: user.STU_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });

                res.json({ message: 'Login successful', token });
            });
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User Details Controller
export const getUserDetails = async (req, res) => {
    try {
        // Get the token from the Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is missing' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Query the user from the database using the decoded user STU_ID
        sqldb.query('SELECT STU_ID, FIRST_NAME, LAST_NAME, EMAIL, NIC, BIRTHDAY, ADDRESS, PHONE FROM student WHERE STU_ID = ?', 
        [decoded.id], (err, results) => {
            if (err) {
                console.error('Error fetching user details:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(results[0]);
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
