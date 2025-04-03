import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Auth.css';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [nic, setNic] = useState('');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password and confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/api/auth/register', {
        firstName,
        lastName,
        email,
        nic,
        birthday,
        address,
        phone,
        password,
        confirmPassword: password,
      });

      console.log('Signup Success:', response.data);
      navigate('/login');

    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
                    <i className="bi bi-mortarboard-fill me-1"></i>
                    Madushani Driving School
                  </div>
                  <h2 className="fs-6 fw-bold text-dark mb-0">Create Your Account</h2>
                </div>

                {error && (
                  <div className="alert alert-danger alert-compact d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-1" style={{ fontSize: '0.75rem' }}></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row compact-mb-2">
                    <div className="col">
                      <label className="form-label fw-medium">First Name</label>
                      <input type="text" className="form-control form-control-sm" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="col">
                      <label className="form-label fw-medium">Last Name</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Email Address</label>
                    <input type="email" className="form-control form-control-sm" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">NIC</label>
                    <input type="text" className="form-control form-control-sm" placeholder="NIC Number" value={nic} onChange={(e) => setNic(e.target.value)} required />
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Birthday</label>
                    <input type="date" className="form-control form-control-sm" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Address</label>
                    <input type="text" className="form-control form-control-sm" placeholder="123 Street, City" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Phone Number</label>
                    <input type="tel" className="form-control form-control-sm" placeholder="0123456789" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>

                  <div className="compact-mb-3">
                    <label className="form-label fw-medium">Password</label>
                    <div className="position-relative">
                      <input type={showPassword ? "text" : "password"} className="form-control form-control-sm" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="compact-mb-3">
                    <label className="form-label fw-medium">Confirm Password</label>
                    <div className="position-relative">
                      <input type={showConfirmPassword ? "text" : "password"} className="form-control form-control-sm" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-grid gap-2 compact-mb-2">
                    <button type="submit" className="btn btn-primary btn-compact" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </div>
                </form>

                <div className="text-center compact-text">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <a href="#" className="text-decoration-none" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                      Sign In
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

export default Signup;
