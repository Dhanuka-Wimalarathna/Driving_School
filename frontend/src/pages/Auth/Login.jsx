import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Auth.css';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', { email, password });
      
      const { token, user } = response.data; // Assuming the response includes user details
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user)); // Store user details
      
      console.log('Login successful:', user);
      navigate('/student'); // Redirect to student dashboard
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred during login. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center py-4 px-2">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card shadow auth-card mx-auto">
              <div className="card-body compact-spacing">
                {/* Brand/Logo */}
                <div className="text-center compact-mb-2">
                  <div className="brand-logo">
                    <i className="bi bi-car-front me-1"></i>
                    Madushani Driving School
                  </div>
                  <h2 className="fs-6 fw-bold text-dark mb-0">Welcome Back</h2>
                </div>
                
                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger alert-compact d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-1" style={{ fontSize: '0.75rem' }}></i>
                    <div>{error}</div>
                  </div>
                )}
                
                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="compact-mb-2">
                    <label htmlFor="email" className="form-label fw-medium">Email Address</label>
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
                  
                  <div className="compact-mb-3">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-sm"
                        id="password"
                        placeholder="Enter your password"
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
                  
                  <div className="d-grid gap-2 compact-mb-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-compact"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" style={{ width: '0.7rem', height: '0.7rem' }} role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </div>
                </form>
                
                {/* Divider */}
                <div className="divider-text">
                  <span className="px-2 bg-white text-muted">or</span>
                </div>
                
                {/* Links */}
                <div className="text-center compact-text">
                  <p className="compact-mb">
                    Forgot your password?{' '}
                    <a 
                      href="#" 
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/reset-password');
                      }}
                    >
                      Reset Password
                    </a>
                  </p>
                  
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <a 
                      href="#" 
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/signup');
                      }}
                    >
                      Create Account
                    </a>
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

export default Login;
