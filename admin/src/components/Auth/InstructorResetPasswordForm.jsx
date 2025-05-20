import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const InstructorResetPasswordForm = () => {
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

    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    try {
      // Call the API to send OTP to the instructor email
      const response = await axios.post('http://localhost:8081/api/instructors/send-otp', { email });
      
      // Store email in sessionStorage for the next steps
      sessionStorage.setItem('instructorResetEmail', email);
      
      // Show success message briefly before navigation
      setSuccess('OTP sent successfully! Redirecting...');
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/instructor/reset-password/otp-verification');
      }, 1500);
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
    <div className="auth-container d-flex align-items-center justify-content-center py-4 px-2">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow auth-card mx-auto">
              <div className="card-body compact-spacing">
                <div className="text-center compact-mb-2">
                  <div className="brand-logo">
                    <i className="bi bi-person-badge me-1"></i>
                    Instructor Portal
                  </div>
                  <h2 className="fs-6 fw-bold text-dark mb-0">Reset Password</h2>
                  <p className="small text-muted mb-0">
                    Enter your email to receive a password reset code
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

                <form onSubmit={handleSubmit}>
                  <div className="compact-mb-2">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      id="email"
                      placeholder="instructor@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <small className="form-text text-muted">
                      Enter the email associated with your instructor account
                    </small>
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
                    <Link to="/instructor/sign-in" className="text-decoration-none">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorResetPasswordForm;