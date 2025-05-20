import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqldb from '../config/sqldb.js';  
import dotenv from 'dotenv';
import { sendOTPEmail } from '../utils/emailService.js';

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

// Delete User Account Controller
export const deleteUser = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
    }

    try {
        // Delete user account from the database
        sqldb.query(
            'DELETE FROM student WHERE STU_ID = ?',
            [userId],
            (err, result) => {
                if (err) {
                    console.error('Error deleting user account:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }

                return res.status(200).json({ message: 'User account deleted successfully' });
            }
        );
    } catch (error) {
        console.error('Error deleting user account:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Send OTP for password reset
export const sendOTP = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    
    try {
        // Check if the email exists in your database
        sqldb.query(
            'SELECT * FROM student WHERE EMAIL = ?',
            [email],
            async (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Server error" });
                }
                
                if (results.length === 0) {
                    return res.status(404).json({ message: "Email not found. Please check your email address." });
                }
                
                const student = results[0];
                
                // Generate a random 6-digit OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                
                // Store OTP in the database with expiration time (15 minutes)
                const expiresAt = new Date();
                expiresAt.setMinutes(expiresAt.getMinutes() + 15);
                
                // First, delete any existing OTPs for this student
                sqldb.query(
                    'DELETE FROM otp_verifications WHERE STU_ID = ?',
                    [student.STU_ID],
                    async (delErr) => {
                        if (delErr) {
                            console.error("Error clearing old OTPs:", delErr);
                            // Continue anyway
                        }
                        
                        // Insert new OTP
                        sqldb.query(
                            'INSERT INTO otp_verifications (STU_ID, OTP_CODE, EXPIRES_AT) VALUES (?, ?, ?)',
                            [student.STU_ID, otp, expiresAt],
                            async (insertErr) => {
                                if (insertErr) {
                                    console.error("Error storing OTP:", insertErr);
                                    return res.status(500).json({ message: "Failed to generate OTP" });
                                }
                                
                                // Send email with OTP
                                const emailSent = await sendOTPEmail(email, otp);
                                
                                if (!emailSent) {
                                    console.log(`Email sending failed, but OTP was generated: ${otp}`);
                                    // For development, continue anyway but with a warning in the response
                                    return res.status(200).json({ 
                                        message: "OTP generated but email could not be sent. For testing purposes, please check server logs for OTP.",
                                        otp: otp // Remove this in production
                                    });
                                }
                                
                                console.log(`OTP for ${email} (student ID: ${student.STU_ID}): ${otp}`);
                                
                                return res.status(200).json({ 
                                    message: "OTP sent successfully. Please check your email.",
                                    // In development, you might want to return the OTP for testing
                                    // Remove in production
                                    otp: otp 
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Verify OTP for password reset
export const verifyOTP = async (req, res) => {
    const { otp, email } = req.body;
    
    if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
    }

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    
    try {
        // First find the student by email
        sqldb.query(
            'SELECT * FROM student WHERE EMAIL = ?',
            [email],
            (err, studentResults) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Server error" });
                }
                
                if (studentResults.length === 0) {
                    return res.status(404).json({ message: "Email not found" });
                }
                
                const student = studentResults[0];
                
                // Now find the OTP record for this student
                sqldb.query(
                    'SELECT * FROM otp_verifications WHERE STU_ID = ? AND OTP_CODE = ?',
                    [student.STU_ID, otp],
                    (otpErr, otpResults) => {
                        if (otpErr) {
                            console.error("Database error:", otpErr);
                            return res.status(500).json({ message: "Server error" });
                        }
                        
                        if (otpResults.length === 0) {
                            return res.status(400).json({ message: "Invalid OTP" });
                        }
                        
                        const otpRecord = otpResults[0];
                        
                        // Check if OTP has expired
                        const now = new Date();
                        const expiresAt = new Date(otpRecord.EXPIRES_AT);
                        
                        if (now > expiresAt) {
                            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
                        }
                        
                        // Generate a reset token to use for password reset
                        const resetToken = Math.random().toString(36).substring(2, 15) + 
                                          Math.random().toString(36).substring(2, 15);
                        
                        // Store reset token in session or use JWT (up to you)
                        // For simplicity, we'll just send it back to be stored in frontend
                        return res.status(200).json({ 
                            message: "OTP verified successfully",
                            resetToken: resetToken,
                            email: email,
                            studentId: student.STU_ID
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Reset password after OTP verification
export const resetPassword = async (req, res) => {
    const { email, password, token } = req.body;
    
    if (!email || !password || !token) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    try {
        // Find the student by email
        sqldb.query(
            'SELECT * FROM student WHERE EMAIL = ?',
            [email],
            async (err, studentResults) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Server error" });
                }
                
                if (studentResults.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                
                const student = studentResults[0];
                
                // Check if there's a valid OTP record for this student
                sqldb.query(
                    'SELECT * FROM otp_verifications WHERE STU_ID = ?',
                    [student.STU_ID],
                    async (otpErr, otpResults) => {
                        if (otpErr) {
                            console.error("Database error:", otpErr);
                            return res.status(500).json({ message: "Server error" });
                        }
                        
                        if (otpResults.length === 0) {
                            return res.status(400).json({ message: "No active reset request found. Please request a new OTP." });
                        }
                        
                        const otpRecord = otpResults[0];
                        
                        // Check if OTP has expired
                        const now = new Date();
                        const expiresAt = new Date(otpRecord.EXPIRES_AT);
                        
                        if (now > expiresAt) {
                            return res.status(400).json({ message: "Reset session has expired. Please request a new OTP." });
                        }
                        
                        try {
                            // Hash the new password
                            const hashedPassword = await bcrypt.hash(password, 10);
                            
                            // Update the password
                            sqldb.query(
                                'UPDATE student SET PASSWORD = ? WHERE STU_ID = ?',
                                [hashedPassword, student.STU_ID],
                                (updateErr, updateResult) => {
                                    if (updateErr) {
                                        console.error("Error updating password:", updateErr);
                                        return res.status(500).json({ message: "Failed to update password" });
                                    }
                                    
                                    if (updateResult.affectedRows === 0) {
                                        return res.status(500).json({ message: "Failed to update password" });
                                    }
                                    
                                    // Delete the OTP record as it's no longer needed
                                    sqldb.query(
                                        'DELETE FROM otp_verifications WHERE STU_ID = ?',
                                        [student.STU_ID]
                                    );
                                    
                                    return res.status(200).json({ message: "Password has been reset successfully" });
                                }
                            );
                        } catch (hashError) {
                            console.error("Password hashing error:", hashError);
                            return res.status(500).json({ message: "Server error" });
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
