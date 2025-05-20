import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const InstructorNewPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Get email and reset token from session storage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('instructorResetEmail');
    const storedToken = sessionStorage.getItem('instructorResetToken');
    
    if (!storedEmail || !storedToken) {
      // If required data is missing, redirect back to reset password page
      navigate('/instructor/reset-password');
    } else {
      setEmail(storedEmail);
      setResetToken(storedToken);
    }
  }, [navigate]);

  // Password validation function
  const validatePassword = (password) => {
    // At least 8 characters long, includes uppercase, number, and special character
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: minLength && hasUppercase && hasNumber && hasSpecial,
      minLength,
      hasUppercase,
      hasNumber,
      hasSpecial
    };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      let errorMsg = 'Password must:';
      if (!validation.minLength) errorMsg += ' be at least 8 characters long;';
      if (!validation.hasUppercase) errorMsg += ' include at least one uppercase letter;';
      if (!validation.hasNumber) errorMsg += ' include at least one number;';
      if (!validation.hasSpecial) errorMsg += ' include at least one special character;';
      
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/api/instructors/reset-password', {
        email,
        password,
        token: resetToken
      });
      
      // Show success message
      setSuccess(response.data.message || 'Password reset successful!');
      
      // Clear session storage
      sessionStorage.removeItem('instructorResetEmail');
      sessionStorage.removeItem('instructorResetToken');
      
      // Navigate to login page after a brief delay
      setTimeout(() => {
        navigate('/instructor/sign-in');
      }, 2000);
      
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
                  <h3 className="fs-6 fw-bold text-dark mb-0">Create New Password</h3>
                  <p className="small text-muted mb-0">
                    Please create a strong, secure password
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

                {/* New Password Form */}
                <form onSubmit={handleSubmit}>
                  <div className="compact-mb-2">
                    <label htmlFor="password" className="form-label fw-medium">
                      New Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-sm"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="compact-mb-2">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">
                      Confirm New Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control form-control-sm"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="compact-mb-3">
                    <div className="password-requirements small text-muted">
                      <p className="mb-1">Password must:</p>
                      <ul className="ps-3 mb-2">
                        <li className={password.length >= 8 ? "text-success" : ""}>
                          Be at least 8 characters long
                        </li>
                        <li className={/[A-Z]/.test(password) ? "text-success" : ""}>
                          Include at least one uppercase letter
                        </li>
                        <li className={/[0-9]/.test(password) ? "text-success" : ""}>
                          Include at least one number
                        </li>
                        <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-success" : ""}>
                          Include at least one special character
                        </li>
                      </ul>
                    </div>
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
                          Resetting Password...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorNewPasswordForm;