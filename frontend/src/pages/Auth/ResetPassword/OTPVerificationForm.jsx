import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import './OTPVerificationForm.css'; // Import the CSS file

const OTPVerificationForm = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate OTP verification
      const response = await axios.post('http://localhost:8081/api/auth/verify-otp', { otp });
      console.log('OTP verified:', response.data);
      navigate('/reset-password/new-password'); // Navigate to New Password page
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
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
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-compact d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-1" style={{ fontSize: '0.75rem' }}></i>
              <div>{error}</div>
            </div>
          )}

          {/* OTP Verification Form */}
          <form onSubmit={handleSubmit}>
            <div className="compact-mb-2">
              <label htmlFor="otp" className="form-label fw-medium">
                Enter OTP
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
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
                onClick={(e) => {
                  e.preventDefault();
                  // Add logic to resend OTP
                  console.log('Resending OTP...');
                }}
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