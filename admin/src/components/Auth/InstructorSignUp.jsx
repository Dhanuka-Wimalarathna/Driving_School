import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Auth.css';

const InstructorSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nic: '',
    licenseNo: '',
    birthday: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleCategory: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Vehicle categories
  const vehicleCategories = [
    { id: 'van', name: 'Van'},
    { id: 'tricycle', name: 'Three Wheelers'},
    { id: 'bike', name: 'Motorbikes'}
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    
    setFormData({
      ...formData,
      vehicleCategory: categoryId
    });
    
    // Clear related errors
    if (errors.vehicleCategory) {
      setErrors({
        ...errors,
        vehicleCategory: ''
      });
    }
  };

  const validateLicenseNumber = (licenseNo) => {
    // Check for exactly 5 digits
    if (!/^\d{5}$/.test(licenseNo)) {
      return 'License number must be exactly 5 digits';
    }
    
    // Check for duplicate digits
    const digitSet = new Set(licenseNo.split(''));
    if (digitSet.size !== licenseNo.length) {
      return 'License number cannot have duplicate digits';
    }
    
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      nic: formData.nic.trim(),
      licenseNo: formData.licenseNo.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim()
    };

    // Name validations
    if (!trimmedData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s.'-]{2,50}$/.test(trimmedData.firstName)) {
      newErrors.firstName = 'Name must be 2-50 letters with basic punctuation';
    }

    if (!trimmedData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s.'-]{2,50}$/.test(trimmedData.lastName)) {
      newErrors.lastName = 'Name must be 2-50 letters with basic punctuation';
    }

    // Email validation
    if (!trimmedData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // NIC validation (Sri Lankan format)
    if (!trimmedData.nic) {
      newErrors.nic = 'NIC is required';
    } else if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(trimmedData.nic)) {
      newErrors.nic = 'Please enter a valid NIC (9 digits with V/X or 12 digits)';
    }

    // License number validation
    if (!trimmedData.licenseNo) {
      newErrors.licenseNo = 'License number is required';
    } else {
      const licenseError = validateLicenseNumber(trimmedData.licenseNo);
      if (licenseError) {
        newErrors.licenseNo = licenseError;
      }
    }

    // Birthday validation
    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    } else {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.birthday = 'You must be at least 18 years old';
      } else if (age > 100) {
        newErrors.birthday = 'Please enter a valid birth date';
      }
    }

    // Address validation
    if (!trimmedData.address) {
      newErrors.address = 'Address is required';
    } else if (trimmedData.address.length < 5 || trimmedData.address.length > 200) {
      newErrors.address = 'Address must be 5-200 characters';
    }

    // Phone validation (Sri Lankan format)
    if (!trimmedData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0[1-9][0-9]{8}$/.test(trimmedData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number starting with 0';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Vehicle category validation
    if (!formData.vehicleCategory) {
      newErrors.vehicleCategory = 'Vehicle category is required';
    }

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
      const response = await axios.post('http://localhost:8081/api/instructors/register', {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        nic: formData.nic.trim(),
        licenseNo: formData.licenseNo.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim()
      });
      
      console.log('Registration successful:', response.data);
      navigate('/instructor/sign-in');
    } catch (err) {
      setErrors({
        server: err.response?.data?.message || 'Registration failed. Please try again.'
      });
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
                  <h2 className="fs-6 fw-bold text-dark mb-0">Create Instructor Account</h2>
                </div>

                {errors.server && (
                  <div className="alert alert-danger alert-compact d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    <div>{errors.server}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <div className="row compact-mb-2">
                    <div className="col">
                      <label className="form-label fw-medium">First Name</label>
                      <input
                        type="text"
                        className={`form-control form-control-sm ${errors.firstName ? 'is-invalid' : ''}`}
                        placeholder="John"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        maxLength={50}
                      />
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>
                    <div className="col">
                      <label className="form-label fw-medium">Last Name</label>
                      <input
                        type="text"
                        className={`form-control form-control-sm ${errors.lastName ? 'is-invalid' : ''}`}
                        placeholder="Doe"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        maxLength={50}
                      />
                      {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Email Address</label>
                    <input
                      type="email"
                      className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="your@email.com"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  {/* NIC */}
                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">NIC</label>
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errors.nic ? 'is-invalid' : ''}`}
                      placeholder="NIC Number"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      maxLength={12}
                    />
                    {errors.nic && <div className="invalid-feedback">{errors.nic}</div>}
                  </div>

                  {/* License No */}
                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">License Number</label>
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errors.licenseNo ? 'is-invalid' : ''}`}
                      placeholder="12345"
                      name="licenseNo"
                      value={formData.licenseNo}
                      onChange={handleChange}
                      maxLength={5}
                      pattern="\d{5}"
                      inputMode="numeric"
                    />
                    {errors.licenseNo && <div className="invalid-feedback">{errors.licenseNo}</div>}
                    <small className="text-muted">Must be exactly 5 unique digits</small>
                  </div>
                  
                  {/* Vehicle Category Selection */}
                  <div className="compact-mb-3">
                    <label className="form-label fw-medium">Vehicle Specification</label>
                    
                    {/* Categories Dropdown */}
                    <div className="dropdown-group">
                      <select
                        className={`form-select form-select-sm ${errors.vehicleCategory ? 'is-invalid' : ''}`}
                        name="vehicleCategory"
                        value={formData.vehicleCategory}
                        onChange={handleCategoryChange}
                      >
                        <option value="">Select Vehicle Category</option>
                        {vehicleCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.vehicleCategory && <div className="invalid-feedback">{errors.vehicleCategory}</div>}
                    </div>
                  </div>

                  {/* Birthday */}
                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Birthday</label>
                    <input
                      type="date"
                      className={`form-control form-control-sm ${errors.birthday ? 'is-invalid' : ''}`}
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    />
                    {errors.birthday && <div className="invalid-feedback">{errors.birthday}</div>}
                  </div>

                  {/* Address */}
                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Address</label>
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errors.address ? 'is-invalid' : ''}`}
                      placeholder="123 Street, City"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      maxLength={200}
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>

                  {/* Phone */}
                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">Phone Number</label>
                    <input
                      type="tel"
                      className={`form-control form-control-sm ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="0123456789"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  {/* Password */}
                  <div className="compact-mb-3">
                    <label className="form-label fw-medium">Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-sm ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Create a strong password"
                        name="password"
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
                    <small className="text-muted">
                      Password must be at least 8 characters with uppercase, lowercase, number, and special character
                    </small>
                  </div>

                  {/* Confirm Password */}
                  <div className="compact-mb-3">
                    <label className="form-label fw-medium">Confirm Password</label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control form-control-sm ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Re-enter password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>      

                  {/* Submit Button */}
                  <div className="d-grid gap-2 compact-mb-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-compact"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </form>

                {/* Sign In Link */}
                <div className="text-center compact-text">
                  <p className="mb-0">
                    Already have an account?{' '}
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

export default InstructorSignUp;