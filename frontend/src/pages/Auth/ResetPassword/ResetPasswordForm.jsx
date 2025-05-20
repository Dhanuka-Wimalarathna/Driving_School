import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPasswordForm.css'; // Import the CSS file

const ResetPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8081/api/auth/send-otp', { email });
      
      // Store email in sessionStorage
      sessionStorage.setItem('resetEmail', email);
      
      // Show success message briefly before navigation
      setSuccess('OTP sent successfully! Redirecting...');
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/reset-password/otp-verification');
      }, 1000);
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
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="card-body compact-spacing">
          {/* Brand/Logo */}
          <div className="text-center compact-mb-2">
            <div className="brand-logo">
              <i className="bi bi-car-front me-1"></i>
              Madhushani Driving School
            </div>
            <h3 className="fs-6 fw-bold text-dark mb-0">Reset Password</h3>
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

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="compact-mb-2">
              <label htmlFor="email" className="form-label fw-medium">
                Email Address
              </label>
              <input
                type="email"
                className="form-control form-control-sm"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="text-center compact-text">
            <p className="mb-0">
              Remember your password?{' '}
              <a
                href="#"
                className="text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;