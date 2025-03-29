const sqldb = require('../config/sqldb');
const bcrypt = require('bcrypt');

const User = {
  create: (userData, callback) => {
    const hashedPassword = bcrypt.hashSync(userData.password, 10); // Hash the password

    const query = `INSERT INTO users (firstName, lastName, email, password, nic, phone, birthday, address) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      userData.firstName,
      userData.lastName,
      userData.email,
      hashedPassword,
      userData.nic,
      userData.phone,
      userData.birthday,
      userData.address
    ];

    sqldb.query(query, values, callback);
  }
};

