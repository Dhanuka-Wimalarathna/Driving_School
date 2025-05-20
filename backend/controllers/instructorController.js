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

// Send OTP for instructor password reset
export const sendOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  
  try {
    // Check if the instructor exists in the database
    Instructor.findByEmail(email, async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Server error" });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Email not found. Please check your email address." });
      }
      
      const instructor = results[0];
      
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in the database with expiration time (15 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      
      // First, delete any existing OTPs for this instructor
      sqldb.query(
        'DELETE FROM instructor_otp_verifications WHERE INS_ID = ?',
        [instructor.ins_id],
        async (delErr) => {
          if (delErr) {
            console.error("Error clearing old OTPs:", delErr);
            // Continue anyway
          }
          
          // Insert new OTP
          sqldb.query(
            'INSERT INTO instructor_otp_verifications (INS_ID, OTP_CODE, EXPIRES_AT) VALUES (?, ?, ?)',
            [instructor.ins_id, otp, expiresAt],
            async (insertErr) => {
              if (insertErr) {
                console.error("Error storing OTP:", insertErr);
                return res.status(500).json({ message: "Failed to generate OTP" });
              }
              
              // In development mode, log the OTP instead of sending an email
              console.log(`==== DEVELOPMENT MODE ====`);
              console.log(`OTP for ${email} (instructor ID: ${instructor.ins_id}): ${otp}`);
              console.log(`==== USE THIS OTP TO RESET PASSWORD ====`);
              
              // In production, you would send an actual email here
              // const emailSent = await sendOTPEmail(email, otp);
              const emailSent = true; // For development
              
              if (!emailSent) {
                return res.status(500).json({ message: "Failed to send OTP email. Please try again." });
              }
              
              return res.status(200).json({ 
                message: "OTP sent successfully. Please check your email.",
                // Remove in production
                otp: otp 
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP for instructor password reset
export const verifyOTP = async (req, res) => {
  const { otp, email } = req.body;
  
  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  
  try {
    // Find the instructor by email
    Instructor.findByEmail(email, (err, instructorResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Server error" });
      }
      
      if (instructorResults.length === 0) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      const instructor = instructorResults[0];
      
      // Now find the OTP record for this instructor
      sqldb.query(
        'SELECT * FROM instructor_otp_verifications WHERE INS_ID = ? AND OTP_CODE = ?',
        [instructor.ins_id, otp],
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
          
          // Generate a reset token
          const resetToken = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);
          
          return res.status(200).json({ 
            message: "OTP verified successfully",
            resetToken: resetToken,
            email: email,
            instructorId: instructor.ins_id
          });
        }
      );
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Reset instructor password after OTP verification
export const resetPassword = async (req, res) => {
  const { email, password, token } = req.body;
  
  if (!email || !password || !token) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  try {
    // Find the instructor by email
    Instructor.findByEmail(email, async (err, instructorResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Server error" });
      }
      
      if (instructorResults.length === 0) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      
      const instructor = instructorResults[0];
      
      // Check if there's a valid OTP record for this instructor
      sqldb.query(
        'SELECT * FROM instructor_otp_verifications WHERE INS_ID = ?',
        [instructor.ins_id],
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
              'UPDATE instructors SET password = ? WHERE ins_id = ?',
              [hashedPassword, instructor.ins_id],
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
                  'DELETE FROM instructor_otp_verifications WHERE INS_ID = ?',
                  [instructor.ins_id]
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
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
