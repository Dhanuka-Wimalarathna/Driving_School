import sqldb from '../config/sqldb.js';
import bcrypt from 'bcryptjs';

const Instructor = {
  create: async (data) => {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const sql = `
        INSERT INTO instructors (firstName, lastName, email, nic, licenseNo, birthday, address, phone, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await sqldb.promise().execute(sql, [
        data.firstName,
        data.lastName,
        data.email,
        data.nic,
        data.licenseNo,
        data.birthday,
        data.address,
        data.phone,
        hashedPassword,
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  findByEmail: async (email) => {
    try {
      const sql = 'SELECT * FROM instructors WHERE email = ?';
      const [rows] = await sqldb.promise().execute(sql, [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  },

  comparePassword: async (enteredPassword, storedPassword) => {
    return bcrypt.compare(enteredPassword, storedPassword);
  },
};

export default Instructor;
