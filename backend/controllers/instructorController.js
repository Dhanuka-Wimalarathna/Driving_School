import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Instructor from '../models/instructorModel.js';
import dotenv from 'dotenv';
import sqldb from '../config/sqldb.js';

dotenv.config();

// Instructor Registration
export const register = async (req, res) => {
    console.log("Received registration request:", req.body);
  
    const { firstName, lastName, email, nic, licenseNo, birthday, address, phone, password, confirmPassword, vehicleCategory } = req.body;
  
    if (!firstName || !lastName || !email || !nic || !licenseNo || !birthday || !address || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  
    try {
      Instructor.checkExistingFields(email, nic, licenseNo, phone, (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Server error" });
        }
  
        if (results.length > 0) {
          console.log("Existing instructor found:", results);
          return res.status(400).json({ message: "Instructor with this email, NIC, license number, or phone already exists" });
        }
  
        const instructorData = { firstName, lastName, email, nic, licenseNo, birthday, address, phone, password, vehicleCategory };
        Instructor.create(instructorData, (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Server error" });
          }
  
          res.status(201).json({ message: "Instructor registered successfully", instructorId: result.insertId });
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

// Enhanced login controller
export const login = (req, res) => {
    const { email, password } = req.body;
  
    Instructor.findByEmail(email, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const instructor = results[0];
  
      bcrypt.compare(password, instructor.password, (err, isMatch) => {
        if (err) {
          console.error('Password comparison error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
  
        const token = jwt.sign(
          { id: instructor.ins_id, role: 'instructor' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
  
        const { password: _, ...instructorData } = instructor;
  
        // Disable caching for this response
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({
          message: 'Login successful',
          token,
          instructor: instructorData
        });
      });
    });
  };
  
  // Enhanced getProfile controller
  export const getProfile = (req, res) => {
    const instructorId = req.userId;
  
    Instructor.findById(instructorId, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
  
      // Disable caching for profile data
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(results[0]);
    });
  };

// Update Instructor Profile
export const updateProfile = (req, res) => {
  const instructorId = req.userId;
  const updateData = req.body;

  // First get current data to compare unique fields
  Instructor.findById(instructorId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    const currentInstructor = results[0];
    
    // Check if unique fields are being changed to existing values
    const checkFields = {};
    if (updateData.email && updateData.email !== currentInstructor.email) {
      checkFields.email = updateData.email;
    }
    if (updateData.nic && updateData.nic !== currentInstructor.nic) {
      checkFields.nic = updateData.nic;
    }
    if (updateData.licenseNo && updateData.licenseNo !== currentInstructor.licenseNo) {
      checkFields.licenseNo = updateData.licenseNo;
    }
    if (updateData.phone && updateData.phone !== currentInstructor.phone) {
      checkFields.phone = updateData.phone;
    }

    if (Object.keys(checkFields).length > 0) {
      Instructor.checkExistingFields(
        checkFields.email || '',
        checkFields.nic || '',
        checkFields.licenseNo || '',
        checkFields.phone || '',
        (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          if (results.length > 0) {
            const existingFields = [];
            if (results.some(r => r.email === checkFields.email)) existingFields.push('email');
            if (results.some(r => r.nic === checkFields.nic)) existingFields.push('NIC');
            if (results.some(r => r.licenseNo === checkFields.licenseNo)) existingFields.push('license number');
            if (results.some(r => r.phone === checkFields.phone)) existingFields.push('phone');
            
            return res.status(400).json({ 
              message: `${existingFields.join(', ')} already registered`
            });
          }

          // Proceed with update if no conflicts
          performUpdate();
        }
      );
    } else {
      // No unique fields being changed, proceed with update
      performUpdate();
    }

    function performUpdate() {
      Instructor.updateProfile(instructorId, updateData, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Instructor not found or no changes made' });
        }

        // Fetch the updated instructor data to return
        Instructor.findById(instructorId, (err, results) => {
          if (err) {
            console.error('Error fetching updated instructor:', err);
            return res.status(200).json({ message: 'Profile updated successfully' });
          }

          if (results.length === 0) {
            return res.status(200).json({ message: 'Profile updated successfully' });
          }

          // Return the updated data
          return res.status(200).json(results[0]);
        });
      });
    }
  });
};

// Update instructor by ID (for specific field updates like status)
export const updateInstructorById = (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (!id) {
    return res.status(400).json({ message: 'Instructor ID is required' });
  }
  
  // Verify instructor exists
  Instructor.findById(id, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    
    // Proceed with update
    Instructor.updateById(id, updateData, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: 'No changes were made' });
      }
      
      // Fetch and return updated data
      Instructor.findById(id, (err, results) => {
        if (err || results.length === 0) {
          return res.status(200).json({ message: 'Instructor updated successfully' });
        }
        
        return res.status(200).json(results[0]);
      });
    });
  });
};

// Fetch all instructors
export const getAllInstructors = (req, res) => {
  const query = "SELECT * FROM instructors";
  
  sqldb.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching instructors:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json(results);
  });
};

// Delete instructor by ID
export const deleteInstructor = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM instructors WHERE ins_id = ?";
  
  sqldb.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting instructor:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json({ message: "Instructor deleted successfully" });
  });
};
