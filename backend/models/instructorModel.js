import bcrypt from 'bcryptjs';
import sqldb from '../config/sqldb.js';

const Instructor = {
  // Find instructor by email
  findByEmail: (email, callback) => {
    sqldb.query('SELECT * FROM instructors WHERE email = ?', [email], callback);
  },

  // Create new instructor
  create: (instructorData, callback) => {
    bcrypt.hash(instructorData.password, 10, (err, hashedPassword) => {
      if (err) return callback(err);
      
      const query = `
        INSERT INTO instructors 
        (firstName, lastName, email, nic, licenseNo, birthday, address, phone, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        instructorData.firstName,
        instructorData.lastName,
        instructorData.email,
        instructorData.nic,
        instructorData.licenseNo,
        instructorData.birthday,
        instructorData.address,
        instructorData.phone,
        hashedPassword
      ];
      
      sqldb.query(query, values, callback);
    });
  },

  // Find instructor by ID (without password)
  findById: (id, callback) => {
    sqldb.query(
      'SELECT ins_id, firstName, lastName, email, nic, licenseNo, birthday, address, phone FROM instructors WHERE ins_id = ?', 
      [id], 
      callback
    );
  },

  // Update instructor profile
  updateProfile: (id, updateData, callback) => {
    const query = `
      UPDATE instructors SET 
      firstName = ?, lastName = ?, email = ?, nic = ?, licenseNo = ?,
      birthday = ?, address = ?, phone = ?
      WHERE ins_id = ?
    `;
    
    const values = [
      updateData.firstName,
      updateData.lastName,
      updateData.email,
      updateData.nic,
      updateData.licenseNo,
      updateData.birthday,
      updateData.address,
      updateData.phone,
      id
    ];
    
    sqldb.query(query, values, callback);
  },

  // Check if email, nic, licenseNo, or phone already exists
  checkExistingFields: (email, nic, licenseNo, phone, callback) => {
    sqldb.query(
      'SELECT * FROM instructors WHERE email = ? OR nic = ? OR licenseNo = ? OR phone = ?',
      [email, nic, licenseNo, phone],
      callback
    );
  }
};

export default Instructor;