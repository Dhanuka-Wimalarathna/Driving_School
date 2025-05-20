import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OTPVerificationForm.css';

const OTPVerificationForm = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Get email from session storage on component mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      // If no email is found, redirect back to reset password page
      navigate('/reset-password');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus the next input field
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace key to go to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // If current field is empty and backspace is pressed, focus previous field
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const otpCode = otp.join(''); // Combine the OTP digits

    // Validate OTP
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/api/auth/verify-otp', { 
        otp: otpCode,
        email: email 
      });
      
      // Store the reset token and email for the next step
      sessionStorage.setItem('resetToken', response.data.resetToken);
      
      // Show success message
      setSuccess('OTP verified successfully! Redirecting...');
      
      // Navigate to new password page after a brief delay
      setTimeout(() => {
        navigate('/reset-password/new-password');
      }, 1500);
      
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await axios.post('http://localhost:8081/api/auth/send-otp', { email });
      setSuccess('A new OTP has been sent to your email.');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    }
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-card">
        <div className="card-body compact-spacing">
          {/* Brand/Logo */}
          <div className="text-center compact-mb-2">
            <div className="brand-logo">
              <i className="bi bi-car-front me-1"></i>
              Madhushani Driving School
            </div>
            <h3 className="fs-6 fw-bold text-dark mb-0">OTP Verification</h3>
            <p className="small text-muted mb-0">
              Enter the 6-digit code sent to {email}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-compact d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-1" style={{ fontSize: '0.75rem' }}></i>
              <div>{error}</div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success alert-compact d-flex align-items-center" role="alert">
              <i className="bi bi-check-circle-fill me-1" style={{ fontSize: '0.75rem' }}></i>
              <div>{success}</div>
            </div>
          )}

          {/* OTP Verification Form */}
          <form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-center gap-2 compact-mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  className="form-control form-control-sm text-center otp-input"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  ref={(el) => (inputRefs.current[index] = el)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="d-grid gap-2 compact-mb-2">
              <button
                type="submit"
                className="btn btn-primary btn-compact"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      style={{ width: '0.7rem', height: '0.7rem' }}
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="text-center compact-text">
            <p className="mb-0">
              Didn't receive the OTP?{' '}
              <a
                href="#"
                className="text-decoration-none"
                onClick={handleResendOTP}
              >
                Resend OTP
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationForm;