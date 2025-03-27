import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';

    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/admins/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store admin details and token in local storage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));

      // Redirect to admin dashboard
      navigate('/admin/dashboard');

    } catch (error) {
      setErrors({ general: error.message });
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
                    <i className="bi bi-shield-lock me-1"></i> Admin Portal
                  </div>
                  <h2 className="fs-6 fw-bold text-dark mb-0">Admin Sign In</h2>
                </div>
                {errors.general && <div className="alert alert-danger">{errors.general}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="compact-mb-2">
                    <label htmlFor="email" className="form-label fw-medium">Email Address</label>
                    <input
                      type="email"
                      className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="admin@example.com"
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
                    <Link to="/admin/forgot-password" className="compact-text text-decoration-none">
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="d-grid gap-2 compact-mb-2">
                    <button type="submit" className="btn btn-primary btn-compact" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Signing In...
                        </>
                      ) : "Sign In"}
                    </button>
                  </div>
                </form>

                <div className="text-center compact-text">
                  <p className="mb-0">Don't have an account? <Link to="/admin/sign-up" className="text-decoration-none">Create Account</Link></p>
                  <p className="compact-mt"><Link to="/" className="text-decoration-none text-muted"><i className="bi bi-arrow-left me-1"></i>Return to Home</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
