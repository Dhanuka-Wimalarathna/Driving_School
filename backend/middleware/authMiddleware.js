import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if Authorization header is present
  if (!authHeader) {
    console.error('Authorization header missing');
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  // Check if it follows "Bearer <token>" format
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Authentication token missing');
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  try {
    // Verify the token with the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Decoded token:', decoded);

    // Store user details in the request object
    req.userId = decoded.id;  // Assuming `id` is the user ID
    req.userRole = decoded.role;  // Assuming `role` is the user role

    console.log(`Token verified for user ID: ${req.userId}`);  // Add logging for successful token verification

    next(); // Token is valid, proceed to the next middleware/controller
  } catch (error) {
    console.error('JWT verification failed:', error.message);  // Log the error message
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else {
      return res.status(401).json({ message: 'Invalid or malformed token' });
    }
  }
};

export default authMiddleware;
