import Instructor from '../models/instructorModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Instructor Registration Controller
export const registerInstructor = (req, res) => {
    const { firstName, lastName, email, nic, licenseNo, birthday, address, phone, password } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !nic || !licenseNo || !birthday || !address || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email already exists
    Instructor.findByEmail(email)
        .then((existingInstructor) => {
            if (existingInstructor) {
                return res.status(400).json({ message: 'Instructor already exists' });
            }

            // Create the new instructor
            return Instructor.create({ firstName, lastName, email, nic, licenseNo, birthday, address, phone, password });
        })
        .then((result) => {
            res.status(201).json({ message: 'Instructor registered successfully', instructorId: result.insertId });
        })
        .catch((error) => {
            console.error('Instructor registration error:', error);
            res.status(500).json({ message: 'Server error' });
        });
};

// Instructor Login Controller
export const loginInstructor = (req, res) => {
    console.log('Login attempt:', req.body.email);
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        console.log('Missing credentials');
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the instructor by email
    Instructor.findByEmail(email)
        .then((instructor) => {
            if (!instructor) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Compare the password
            return Instructor.comparePassword(password, instructor.password).then((isMatch) => {
                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }

                // Generate JWT token
                const token = jwt.sign({ id: instructor.id }, process.env.JWT_SECRET, {
                    expiresIn: '1h',
                });

                res.json({ message: 'Login successful', token, instructor });
            });
        })
        .catch((error) => {
            console.error('Instructor login error:', error);
            res.status(500).json({ message: 'Server error' });
        });
};

export const getInstructorProfile = async (req, res) => {
    try {
      // The authMiddleware should have added the decoded user to req.user
      const instructorId = req.user.id;
  
      // Make sure your model has this method
      const instructor = await Instructor.findById(instructorId);
      
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
  
      // Return sanitized instructor data (without password)
      const instructorData = {
        id: instructor.id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        nic: instructor.nic,
        licenseNo: instructor.licenseNo,
        phone: instructor.phone,
        createdAt: instructor.createdAt
      };
  
      res.json({ instructor: instructorData });
    } catch (error) {
      console.error('Error fetching instructor:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };