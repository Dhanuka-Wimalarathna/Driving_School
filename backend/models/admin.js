import sqldb from '../config/sqldb.js';
import bcrypt from 'bcryptjs';

const Admin = {
  create: (firstName, lastName, email, password) => {
    return new Promise((resolve, reject) => {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const query = 'INSERT INTO admins (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
      sqldb.query(query, [firstName, lastName, email, hashedPassword], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM admins WHERE email = ?';
      sqldb.query(query, [email], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          reject(new Error('Database query failed'));
        }
        resolve(result[0] || null);
      });
    });
  },

  // Add this new method to compare passwords
  comparePassword: async (plainPassword, hashedPassword) => {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Password comparison error:', error);
      throw error;
    }
  }
};

export default Admin;