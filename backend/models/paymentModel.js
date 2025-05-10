// models/paymentModel.js
import sqldb from '../config/sqldb.js';

export const getPaymentHistory = (studentId, callback) => {
  const query = `
    SELECT 
      payment_id AS id,
      amount,
      status,
      transaction_date AS date
    FROM payments 
    WHERE student_id = ?
    ORDER BY transaction_date DESC
  `;
  sqldb.query(query, [studentId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

export const createPayment = (studentId, packageId, amount, status, transactionId, callback) => {
  // Add more logging to help debug issues
  console.log('Creating payment with data:', {
    studentId,
    packageId,
    amount,
    status,
    transactionId
  });

  const query = `
    INSERT INTO payments (student_id, package_id, amount, status, transaction_id, transaction_date)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  sqldb.query(
    query,
    [studentId, packageId, amount, status, transactionId],
    (err, result) => {
      if (err) {
        console.error('SQL Error in createPayment:', err);
        return callback(err);
      }
      console.log('Payment created successfully, result:', result);
      callback(null, result);
    }
  );
};