import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// This ensures environment variables are loaded
dotenv.config();

// For debugging
console.log('Email config:', {
  user: process.env.EMAIL_USER || 'NOT SET',
  passLength: process.env.APP_PASSWORD ? process.env.APP_PASSWORD.length : 0
});

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,   // 10 seconds
  socketTimeout: 15000      // 15 seconds
});

// Test the connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to accept messages');
  }
});

// Function to send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    // Double check credentials before sending
    if (!process.env.EMAIL_USER || !process.env.APP_PASSWORD) {
      console.error('Missing email credentials:', {
        user: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
        password: process.env.APP_PASSWORD ? 'SET' : 'NOT SET'
      });
      return false;
    }

    // Try to send email
    const info = await transporter.sendMail({
      from: `"Madhushani Driving School" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - Madhushani Driving School',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">Madhushani Driving School</h2>
            <p style="color: #666;">Password Reset Request</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px;">Your One-Time Password (OTP) for password reset is:</p>
            <h1 style="text-align: center; letter-spacing: 5px; margin: 15px 0; font-size: 30px; color: #4a6ee0;">${otp}</h1>
            <p style="margin: 0; font-size: 14px; color: #777;">This OTP will expire in 15 minutes.</p>
          </div>
          
          <div style="font-size: 14px; color: #666;">
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>For any assistance, please contact our support team.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Madhushani Driving School. All rights reserved.</p>
          </div>
        </div>
      `
    });
    
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};