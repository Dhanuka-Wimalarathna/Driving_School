import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/sqldb.js';  // Using regular mysql2
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// User Registration Controller
export const registerUser = async (req, res) => {
    console.log('Request Body:', req.body);
    const { firstName, lastName, email, password } = req.body;
  
    try {
      // Check if the email is already in use
      db.query('SELECT * FROM student WHERE EMAIL = ?', [email], (err, results) => {
        if (err) {
          console.error('Database error during registration:', err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        if (results.length > 0) {
          return res.status(400).json({ message: 'Email already registered' });
        }
  
        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Password hashing error:', err);
            return res.status(500).json({ message: 'Server error' });
          }
  
          // Debugging: Log the values being inserted
          console.log('Inserting user:', { firstName, lastName, email, hashedPassword });
  
          // Insert new user into database
          db.query(
            'INSERT INTO student (FIRST_NAME, LAST_NAME, EMAIL, PASSWORD) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword],
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
        db.query('SELECT * FROM student WHERE EMAIL = ?', [email], (err, results) => {
            if (err) {
                console.error('Database error during login:', err);
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
        const token = req.header('Authorization').replace('Bearer ', '');

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Query the user from the database using the decoded user STU_ID
        const [user] = await db.query('SELECT * FROM student WHERE STU_ID = ?', [decoded.id]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the user details
        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
