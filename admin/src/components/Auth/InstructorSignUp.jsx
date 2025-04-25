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
    grade: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    console.log(`Changing ${e.target.name} to ${e.target.value}`);
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.nic.trim()) newErrors.nic = 'NIC is required';
    if (!formData.licenseNo.trim()) newErrors.licenseNo = 'License number is required';
    if (!formData.birthday) newErrors.birthday = 'Birthday is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.grade) newErrors.grade = 'Grade is required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    console.log('Sending data:', formData); 

    setLoading(true);
    
    try {
      // const response = await axios.post('http://localhost:8081/api/instructors/register', {
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   email: formData.email,
      //   nic: formData.nic,
      //   licenseNo: formData.licenseNo,
      //   birthday: formData.birthday,
      //   address: formData.address,
      //   phone: formData.phone,
      //   password: formData.password
      // });

      const response = await axios.post('http://localhost:8081/api/instructors/register', formData);

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
                    />
                    {errors.nic && <div className="invalid-feedback">{errors.nic}</div>}
                  </div>

                  {/* License No */}
                  <div className="compact-mb-2">
                    <label className="form-label fw-medium">License Number</label>
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errors.licenseNo ? 'is-invalid' : ''}`}
                      placeholder="License Number"
                      name="licenseNo"
                      value={formData.licenseNo}
                      onChange={handleChange}
                    />
                    {errors.licenseNo && <div className="invalid-feedback">{errors.licenseNo}</div>}
                  </div>
                  
                  {/* Grade */}
                  <div className="compact-mb-2">
                    <label className="form-label fw-medium d-block mb-2">Grade</label>
                    <div className="d-flex gap-2">
                      {['A', 'B', 'C'].map((gradeOption) => (
                        <button
                          type="button"
                          key={gradeOption}
                          className={`btn btn-sm ${formData.grade === gradeOption ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleChange({ target: { name: 'grade', value: gradeOption } })}
                        >
                          {gradeOption}
                        </button>
                      ))}
                    </div>
                    {errors.grade && <div className="invalid-feedback d-block mt-1">{errors.grade}</div>}
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