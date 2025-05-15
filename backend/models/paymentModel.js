import sqldb from '../config/sqldb.js';

export const getPaymentHistory = (studentId, callback) => {
  const query = `
    SELECT 
      payment_id,
      student_id,
      package_id,
      amount,
      status,
      payment_method,
      transaction_id,
      transaction_date
    FROM payments 
    WHERE student_id = ?
    ORDER BY transaction_date DESC
  `;
  sqldb.query(query, [studentId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

export const createPayment = (studentId, packageId, amount, status, paymentMethod, transactionId, callback) => {
  console.log('Creating payment with data:', {
    studentId,
    packageId,
    amount,
    status,
    paymentMethod, // Log the payment method
    transactionId
  });

  const query = `
    INSERT INTO payments (student_id, package_id, amount, status, payment_method, transaction_id, transaction_date)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;
  sqldb.query(
    query,
    [studentId, packageId, amount, status, paymentMethod, transactionId],
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

// Add this function to update payment status
export const updatePaymentStatus = (paymentId, status, callback) => {
  const query = `
    UPDATE payments 
    SET status = ?
    WHERE payment_id = ?
  `;
  sqldb.query(query, [status, paymentId], (err, result) => {
    if (err) {
      console.error('SQL Error in updatePaymentStatus:', err);
      return callback(err);
    }
    console.log('Payment status updated successfully, result:', result);
    callback(null, result);
  });
};

// Update getAllPendingPayments function with correct column names
export const getAllPendingPayments = (callback) => {
  const query = `
    SELECT 
      p.payment_id,
      p.student_id,
      CONCAT(s.FIRST_NAME, ' ', s.LAST_NAME) AS student_name,
      p.package_id,
      pkg.title AS packageName,
      p.amount,
      p.status,
      p.payment_method,
      p.transaction_id,
      p.transaction_date
    FROM payments p
    JOIN student s ON p.student_id = s.STU_ID
    JOIN packages pkg ON p.package_id = pkg.package_id
    WHERE p.status = 'pending'
    ORDER BY p.transaction_date DESC
  `;
  sqldb.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Update getAllPayments function with correct column names
export const getAllPayments = (callback) => {
  const query = `
    SELECT 
      p.payment_id,
      p.student_id,
      CONCAT(s.FIRST_NAME, ' ', s.LAST_NAME) AS student_name,
      p.package_id,
      pkg.title AS packageName,
      p.amount,
      p.status,
      p.payment_method,
      p.transaction_id,
      p.transaction_date
    FROM payments p
    JOIN student s ON p.student_id = s.STU_ID
    JOIN packages pkg ON p.package_id = pkg.package_id
    ORDER BY p.transaction_date DESC
  `;
  sqldb.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};
