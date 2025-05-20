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
        (firstName, lastName, email, nic, licenseNo, birthday, address, phone, password, vehicleCategory, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        hashedPassword,
        instructorData.vehicleCategory,
        instructorData.status || 'available'  // Default status if not provided
      ];
      
      sqldb.query(query, values, callback);
    });
  },

  // Find instructor by ID (without password)
  findById: (id, callback) => {
    sqldb.query(
      'SELECT ins_id, firstName, lastName, email, nic, licenseNo, birthday, address, phone, vehicleCategory, status, created_at FROM instructors WHERE ins_id = ?', 
      [id], 
      callback
    );
  },

  // Update instructor profile
  updateProfile: (id, updateData, callback) => {
    // Build dynamic query based on what fields are provided
    let fields = [];
    let values = [];

    // Map updateData fields to SQL columns
    const fieldMap = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      nic: 'nic',
      licenseNo: 'licenseNo',
      birthday: 'birthday',
      address: 'address',
      phone: 'phone',
      status: 'status'
    };

    // Add fields to update based on what was provided
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'password' && key !== 'confirmPassword' && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        values.push(value);
      }
    }

    // If no fields to update, process password or return
    if (fields.length === 0 && !updateData.password) {
      return callback(null, { affectedRows: 0 });
    }

    // Handle password update if provided
    if (updateData.password) {
      return bcrypt.hash(updateData.password, 10, (err, hashedPassword) => {
        if (err) return callback(err);
        
        fields.push('password = ?');
        values.push(hashedPassword);
        
        const query = `UPDATE instructors SET ${fields.join(', ')} WHERE ins_id = ?`;
        values.push(id);
        
        sqldb.query(query, values, callback);
      });
    }

    // Construct query and execute for non-password updates
    const query = `UPDATE instructors SET ${fields.join(', ')} WHERE ins_id = ?`;
    values.push(id);
    
    sqldb.query(query, values, callback);
  },

  // Check if fields already exist (for unique constraints)
  checkExistingFields: (email, nic, licenseNo, phone, callback) => {
    sqldb.query(
      'SELECT email, nic, licenseNo, phone FROM instructors WHERE email = ? OR nic = ? OR licenseNo = ? OR phone = ?',
      [email, nic, licenseNo, phone],
      callback
    );
  },
  
  // Update specific fields for an instructor (like status)
  updateById: (id, data, callback) => {
    // Build dynamic query based on what fields are provided
    let fields = [];
    let values = [];
    
    // Add fields that can be updated
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    
    // Add other fields as needed
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    
    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }
    
    // If no fields to update, return
    if (fields.length === 0) {
      return callback(null, { affectedRows: 0 });
    }
    
    // Construct and execute query
    const query = `UPDATE instructors SET ${fields.join(', ')} WHERE ins_id = ?`;
    values.push(id);
    
    sqldb.query(query, values, callback);
  }
};

export default Instructor;