import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQzMjU1MTc2LCJleHAiOjE3NDMyNTg3NzZ9.xsn5VmDjO6YxX8NRxq4Qs6WAQXWFRp1UYi52h5U9Qhg'; // Replace with the actual token from the frontend
const secret = process.env.JWT_SECRET; // Use your real secret key

try {
    const decoded = jwt.verify(token, secret);
    console.log("Decoded Token:", decoded);
} catch (err) {
    console.error("Invalid token:", err);
}
