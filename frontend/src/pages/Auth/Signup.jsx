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

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };

  const validateNIC = (nic) => {
    // Validate Sri Lankan NIC format (old 10-digit or new 12-digit)
    const oldNicFormat = /^[0-9]{9}[vVxX]$/;
    const newNicFormat = /^[0-9]{12}$/;
    return oldNicFormat.test(nic) || newNicFormat.test(nic);
  };

  const validatePhone = (phone) => {
    // Validate Sri Lankan phone numbers (9 or 10 digits starting with 0)
    return /^0[0-9]{9}$/.test(phone);
  };

  const validateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 17; // Minimum age 17 for driving school
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Trim all input values
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedNic = nic.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();

    // Validate required fields
    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedNic || 
        !birthday || !trimmedAddress || !trimmedPhone || !password || !confirmPassword) {
      setError('All fields are required!');
      setLoading(false);
      return;
    }

    // Validate name fields (only letters, spaces, and certain special characters)
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmedFirstName) || !/^[a-zA-Z\s.'-]+$/.test(trimmedLastName)) {
      setError('Names can only contain letters, spaces, and basic punctuation');
      setLoading(false);
      return;
    }

    // Validate email format
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate NIC format
    if (!validateNIC(trimmedNic)) {
      setError('Please enter a valid NIC number (10 digits ending with V/X or 12 digits)');
      setLoading(false);
      return;
    }

    // Validate age (minimum 17 years)
    if (!validateAge(birthday)) {
      setError('You must be at least 17 years old to register');
      setLoading(false);
      return;
    }

    // Validate phone number
    if (!validatePhone(trimmedPhone)) {
      setError('Please enter a valid phone number (10 digits starting with 0)');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    // Validate password and confirm password match
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/api/auth/register', {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        nic: trimmedNic,
        birthday,
        address: trimmedAddress,
        phone: trimmedPhone,
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
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder="John" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        maxLength={50}
                        required 
                      />
                    </div>
                    <div className="col">
                      <label className="form-label fw-medium">Last Name</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder="Doe" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        maxLength={50}
                        required 
                      />
                    </div>
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control form-control-sm" 
                      placeholder="your@email.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">NIC</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="NIC Number" 
                      value={nic} 
                      onChange={(e) => setNic(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Birthday</label>
                    <input 
                      type="date" 
                      className="form-control form-control-sm" 
                      value={birthday} 
                      onChange={(e) => setBirthday(e.target.value)} 
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      required 
                    />
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Address</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="123 Street, City" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      maxLength={200}
                      required 
                    />
                  </div>

                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control form-control-sm" 
                      placeholder="0123456789" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      pattern="[0-9]{10}"
                      required 
                    />
                  </div>

                  <div className="compact-mb-3">
                    <label className="form-label fw-medium">Password</label>
                    <div className="position-relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control form-control-sm" 
                        placeholder="Create a strong password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        minLength={8}
                        required 
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                    <small className="text-muted">
                      Password must be at least 8 characters with uppercase, lowercase, number, and special character
                    </small>
                  </div>

                  <div className="compact-mb-3">
                    <label className="form-label fw-medium">Confirm Password</label>
                    <div className="position-relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="form-control form-control-sm" 
                        placeholder="Re-enter password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        minLength={8}
                        required 
                      />
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