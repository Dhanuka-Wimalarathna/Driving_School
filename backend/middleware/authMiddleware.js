import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// authMiddleware.js
const authMiddleware = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Full decoded token:', decoded); // Add this for debugging
      
      // Verify the token has the required role
      if (requiredRole && decoded.role !== requiredRole) {
        console.log(`Role mismatch: Required ${requiredRole}, got ${decoded.role}`);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

export default authMiddleware;