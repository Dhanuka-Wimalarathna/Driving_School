import { createPayment, getPaymentHistory, updatePaymentStatus, getAllPendingPayments, getAllPayments } from '../models/paymentModel.js';

export const handleCreatePayment = (req, res) => {
  try {
    const { 
      packageId, 
      amount, 
      transactionId,
      paymentMethod 
    } = req.body;

    // Manual validation instead of express-validator
    const errors = [];
    
    if (!packageId || typeof packageId !== 'number') {
      errors.push('Invalid package ID');
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      errors.push('Amount must be a positive number');
    }
    
    if (!transactionId || typeof transactionId !== 'string') {
      errors.push('Invalid transaction ID');
    }
    
    if (!['card', 'cash', 'bank'].includes(paymentMethod)) {
      errors.push('Invalid payment method');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        errors,
        message: 'Validation failed'
      });
    }

    // Set initial status to 'pending'
    const initialStatus = 'pending';

    createPayment(
      req.userId,
      packageId,
      amount,
      initialStatus,
      paymentMethod,
      transactionId,
      (err, result) => {
        if (err) {
          console.error('Payment error:', err);
          return res.status(500).json({
            message: err.message || 'Payment processing failed'
          });
        }
        
        res.status(201).json({
          message: 'Payment submitted successfully. Waiting for approval.',
          paymentId: result.insertId,
          amount,
          paymentMethod,
          status: initialStatus,
          transactionId
        });
      }
    );
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({
      message: err.message || 'Payment processing failed'
    });
  }
};

// Add a new controller function for approving payments
export const handleApprovePayment = (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId || isNaN(Number(paymentId))) {
      return res.status(400).json({
        message: 'Invalid payment ID'
      });
    }

    updatePaymentStatus(paymentId, 'paid', (err, result) => {
      if (err) {
        console.error('Payment approval error:', err);
        return res.status(500).json({
          message: err.message || 'Payment approval failed'
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Payment not found'
        });
      }
      
      res.status(200).json({
        message: 'Payment approved successfully',
        paymentId: Number(paymentId),
        status: 'paid'
      });
    });
  } catch (err) {
    console.error('Payment approval error:', err);
    res.status(500).json({
      message: err.message || 'Payment approval failed'
    });
  }
};

// Add a new controller function for rejecting payments
export const handleRejectPayment = (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId || isNaN(Number(paymentId))) {
      return res.status(400).json({
        message: 'Invalid payment ID'
      });
    }

    updatePaymentStatus(paymentId, 'failed', (err, result) => {
      if (err) {
        console.error('Payment rejection error:', err);
        return res.status(500).json({
          message: err.message || 'Payment rejection failed'
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Payment not found'
        });
      }
      
      res.status(200).json({
        message: 'Payment rejected successfully',
        paymentId: Number(paymentId),
        status: 'failed'
      });
    });
  } catch (err) {
    console.error('Payment rejection error:', err);
    res.status(500).json({
      message: err.message || 'Payment rejection failed'
    });
  }
};

// Add a function to get all pending payments (admin only)
export const handleGetPendingPayments = (req, res) => {
  // Check if user is admin
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin privileges required.'
    });
  }
  
  // Call model function to get all pending payments
  getAllPendingPayments((err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        message: 'Failed to retrieve pending payments',
        error: err.message 
      });
    }
    
    res.status(200).json(rows || []);
  });
};

export const handleGetPayments = (req, res) => {
  // For admin users, show all payments from all students
  if (req.userRole === 'admin') {
    getAllPayments((err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          message: 'Failed to retrieve payments',
          error: err.message 
        });
      }
      
      res.status(200).json(rows || []);
    });
    return;
  }
  
  // For regular users, show only their own payments
  const studentId = req.userId;

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