import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const InstructorSignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting login form:', formData);
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8081/api/instructors/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
  
      console.log('Login successful:', data);
      
      // Store the token and instructor ID in localStorage
      localStorage.setItem('token', data.token);  // Store the token
      localStorage.setItem('instructorId', data.instructor.ins_id); // Store instructor ID
      localStorage.setItem('instructorEmail', data.instructor.email); // Store the email for profile lookups
    
      // Log to verify it's stored
      console.log('Instructor ID stored in localStorage:', localStorage.getItem('instructorId'));
      
      navigate('/instructor/dashboard');
      
    } catch (error) {
      setErrors({ server: error.message });
      console.error('Login error:', error);
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
                <div className="text-center compact-mb-2">
                  <div className="brand-logo">
                    <i className="bi bi-person-badge me-1"></i>
                    Instructor Portal
                  </div>
                  <h2 className="fs-6 fw-bold text-dark mb-0">Instructor Sign In</h2>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="compact-mb-2">
                    <label htmlFor="email" className="form-label fw-medium">Email Address</label>
                    <input
                      type="email"
                      className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="instructor@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="compact-mb-3">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-sm ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center compact-mb-3">
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <label className="form-check-label compact-text" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <Link to="/instructor/forgot-password" className="compact-text text-decoration-none">
                      Forgot Password?
                    </Link>
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
                <div className="divider-text">
                  <span className="px-2 bg-white text-muted">or</span>
                </div>
                <div className="text-center compact-text">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/instructor/sign-up" className="text-decoration-none">Create Account</Link>
                  </p>
                  <p className="compact-mt">
                    <Link to="/" className="text-decoration-none text-muted">
                      <i className="bi bi-arrow-left me-1"></i>Return to Home
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

export default InstructorSignIn;
