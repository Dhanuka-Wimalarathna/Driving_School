import sqldb from '../config/sqldb.js';
import bcrypt from 'bcryptjs';

const Admin = {
  create: (firstName, lastName, email, password) => {
    return new Promise((resolve, reject) => {
      const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password

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
        if (err) reject(err);
        resolve(result[0]);
      });
    });
  },

  comparePassword: (enteredPassword, storedPassword) => {
    return bcrypt.compareSync(enteredPassword, storedPassword);
  },
};

export default Admin;
