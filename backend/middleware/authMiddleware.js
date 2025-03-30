import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];  // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.log("Decoded user ID:", req.userId); // Log userId from token

};

export default authMiddleware;
