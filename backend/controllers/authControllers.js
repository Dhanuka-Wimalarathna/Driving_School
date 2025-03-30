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
        sqldb.query(
            'SELECT * FROM student WHERE EMAIL = ? OR NIC = ? OR PHONE = ?', 
            [email, nic, phone], 
            async (err, results) => {  // Make callback async
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                if (results.length > 0) {
                    return res.status(400).json({ message: 'Email, NIC, or phone already registered' });
                }

                try {
                    // Hash the password before inserting into the database
                    const hashedPassword = await bcrypt.hash(password, 10);
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
                } catch (hashError) {
                    console.error('Password hashing error:', hashError);
                    return res.status(500).json({ message: 'Server error' });
                }
            }
        );
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

                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.STU_ID,
                        firstName: user.FIRST_NAME,
                        lastName: user.LAST_NAME,
                        email: user.EMAIL,
                        nic: user.NIC,
                        birthday: user.BIRTHDAY,
                        address: user.ADDRESS,
                        phone: user.PHONE
                    }
                });
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
        // Access userId from the request object (set by authMiddleware)
        const userId = req.userId;

        // Query the user from the database using the userId
        sqldb.query('SELECT STU_ID, FIRST_NAME, LAST_NAME, EMAIL, NIC, BIRTHDAY, ADDRESS, PHONE FROM student WHERE STU_ID = ?', 
        [userId], (err, results) => {
            if (err) {
                console.error('Error fetching user details:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Return the user details
            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update User Profile Controller
export const updateProfile = async (req, res) => {
    const { firstName, lastName, email, nic, birthday, address, phone } = req.body;
    const userId = req.userId;

    // Log the received data
    console.log("Decoded user ID:", userId);
    console.log("Received data:", req.body);

    // Check if any required fields are missing
    if (!firstName || !lastName || !email || !nic || !birthday || !address || !phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
    }

    // Ensure birthday is in correct format (YYYY-MM-DD)
    const formattedBirthday = new Date(birthday).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format

    try {
        // Update user details in the database
        sqldb.query(
            'UPDATE student SET FIRST_NAME = ?, LAST_NAME = ?, EMAIL = ?, NIC = ?, BIRTHDAY = ?, ADDRESS = ?, PHONE = ? WHERE STU_ID = ?',
            [firstName, lastName, email, nic, formattedBirthday, address, phone, userId],
            (err, result) => {
                if (err) {
                    console.error('Error updating user details:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                console.log('Query result:', result); // Log the result to check the update
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }

                return res.status(200).json({ message: 'User details updated successfully' });
            }
        );
    } catch (error) {
        console.error('Error updating user details:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
