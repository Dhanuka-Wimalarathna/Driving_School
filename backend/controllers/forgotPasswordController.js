import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import sqldb from '../config/sqldb.js';
import axios from 'axios';

// In-memory storage for OTPs
const otpStorage = {};


// Send OTP
export const sendOTP = async (req, res) => {
    const { email } = req.body;
    console.log("Received email:", email);

    try {
        // ✅ Step 1: Check if the user exists in MySQL
        sqldb.query('SELECT * FROM student WHERE EMAIL = ?', [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            // ✅ Step 2: Generate a 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // ✅ Step 3: Store OTP temporarily (Use Redis/DB in production)
            // You can replace this with a database insert if needed
            global.otpStorage = global.otpStorage || {};
            global.otpStorage[email] = otp;

            console.log(`Generated OTP for ${email}: ${otp}`);

            // ✅ Step 4: Send the OTP via email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your OTP for Password Reset',
                text: `Your OTP for resetting your password is: ${otp}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Failed to send OTP' });
                } else {
                    console.log('Email sent:', info.response);
                    return res.status(200).json({ message: 'OTP sent successfully' });
                }
            });
        });

    } catch (error) {
        console.error('Error in sendOTP controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
  
  

// Verify OTP
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if the OTP matches
    if (otpStorage[email] === otp) {
      // Clear the OTP from storage after verification
      delete otpStorage[email];
      return res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error in verifyOTP controller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email (simulated)
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password (simulated)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password (simulated)
    user.password = hashedPassword;

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword controller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};