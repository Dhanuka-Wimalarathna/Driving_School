import { createPayment, getPaymentHistory } from '../models/paymentModel.js';

export const handleCreatePayment = (req, res) => {
  console.log('Incoming request body:', req.body);
  const studentId = req.userId;
  const { packageId, amount, transactionId } = req.body;

  // Enhanced validation with better error messages
  const errors = [];
  if (!packageId) errors.push('packageId');
  if (!amount || typeof amount !== 'number') errors.push('valid amount');
  if (!transactionId) errors.push('transactionId');

  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    return res.status(400).json({
      message: `Missing/invalid fields: ${errors.join(', ')}`,
      missingFields: errors
    });
  }

  // Convert packageId to number if it's a string
  const packageIdNum = typeof packageId === 'string' ? parseInt(packageId, 10) : packageId;
  
  if (isNaN(packageIdNum)) {
    return res.status(400).json({
      message: 'Invalid packageId: must be a number',
    });
  }

  createPayment(studentId, packageIdNum, amount, 'paid', transactionId, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        message: 'Payment creation failed',
        error: err.sqlMessage 
      });
    }
    
    res.status(201).json({ 
      message: 'Payment successful',
      paymentId: result.insertId,
      amount: amount,
      transactionId: transactionId
    });
  });
};

export const handleGetPayments = (req, res) => {
  // Determine which student ID to use
  const studentId = req.userRole === 'admin' && req.query.studentId 
    ? req.query.studentId 
    : req.userId;

  // Validate studentId exists and is a number
  if (!studentId || isNaN(Number(studentId))) {
    return res.status(400).json({ 
      message: 'Invalid student ID',
      received: studentId
    });
  }

  getPaymentHistory(studentId, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        message: 'Failed to retrieve payments',
        error: err.message 
      });
    }
    
    // If no rows found, return empty array rather than null
    res.status(200).json(rows || []);
  });
};