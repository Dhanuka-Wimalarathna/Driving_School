import React, { useState, useEffect } from "react";
import axios from "axios";
import InstructorSidebar from "../../../components/Sidebar/InstructorSidebar";
import { User, Mail, Phone, Calendar, MapPin, Truck, AlertCircle, Edit, Clock, X } from "lucide-react";
import styles from "./InstructorProfile.module.css";

const InstructorProfile = () => {
  const [instructor, setInstructor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    status: "available" 
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Status options for the instructor
  const statusOptions = [
    { value: "available", label: "Available", color: "#10b981" },
    { value: "on_leave", label: "On Leave", color: "#f59e0b" },
    { value: "training", label: "Training", color: "#6366f1" }
  ];

  useEffect(() => {
    fetchInstructorData();
  }, []);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  // Hide error message after 5 seconds
  useEffect(() => {
    if (updateError) {
      const timer = setTimeout(() => {
        setUpdateError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateError]);

  const fetchInstructorData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get the token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("You are not logged in. Please log in to view your profile.");
      }
      
      // Get email from localStorage if it was stored during login
      const email = localStorage.getItem('instructorEmail');
      
      // First, fetch all instructors
      const response = await axios.get("http://localhost:8081/api/instructors");
      
      // Find the currently logged-in instructor by email if available
      // If email is not available, use the first instructor for demonstration
      let currentInstructor;
      if (email) {
        currentInstructor = response.data.find(inst => inst.email === email);
      }
      
      // If no match found by email, try to find by ID
      if (!currentInstructor) {
        const instructorId = localStorage.getItem('instructorId');
        if (instructorId) {
          currentInstructor = response.data.find(inst => inst.ins_id == instructorId);
        }
      }
      
      // If still no match, use the first instructor (for development)
      if (!currentInstructor && response.data.length > 0) {
        currentInstructor = response.data[0];
        console.log("Using first instructor from list as current user");
      }
      
      if (!currentInstructor) {
        throw new Error("Could not find your instructor profile. Please contact administrator.");
      }
      
      // Store the instructor data
      setInstructor(currentInstructor);
      
      // Initialize form data
      setFormData({
        phone: currentInstructor.phone || "",
        address: currentInstructor.address || "",
        password: "",
        confirmPassword: "",
        status: currentInstructor.status || "available" // Set default if not provided
      });
    } catch (err) {
      console.error("Error fetching instructor data:", err);
      setError(err.message || "Failed to load your profile information. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to show success message
  const showSuccessMessage = () => {
    setUpdateSuccess(true);
  };

  // Function to show error message
  const showErrorMessage = (message) => {
    setUpdateError(message);
  };

  const handleStatusChange = async (newStatus) => {
    if (!instructor || !instructor.ins_id) {
      alert("Cannot update status. Instructor ID not found.");
      return;
    }

    // Don't update if it's the same status
    if (instructor.status === newStatus) {
      return;
    }

    setIsUpdating(true);
    
    // Update UI immediately for better user experience
    const originalStatus = instructor.status;
    
    // Optimistically update UI
    setInstructor({
      ...instructor,
      status: newStatus
    });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("You are not logged in. Please log in to update your status.");
      }
      
      // Make API call to update status
      const response = await axios.put(
        `http://localhost:8081/api/instructors/${instructor.ins_id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Only update UI if the API call was successful
      if (response.status === 200) {
        // Update instructor data with response data or with local update
        const updatedInstructor = response.data || {
          ...instructor,
          status: newStatus
        };
        
        setInstructor(updatedInstructor);
        
        // Update form data
        setFormData({
          ...formData,
          status: newStatus
        });
        
        showSuccessMessage();
      } else {
        throw new Error("Failed to update status. Server response: " + response.status);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showErrorMessage("Failed to update status: " + (err.response?.data?.message || err.message));
      
      // Revert UI to original status on error
      setInstructor({
        ...instructor,
        status: originalStatus
      });
      
      // Reset form data status
      setFormData({
        ...formData,
        status: originalStatus
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password matching if being changed
    if (formData.password && formData.password !== formData.confirmPassword) {
      showErrorMessage("Passwords do not match");
      return;
    }
    
    // Need instructor ID to update
    if (!instructor || !instructor.ins_id) {
      showErrorMessage("Instructor ID not found. Cannot update profile.");
      return;
    }
    
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("You are not logged in. Please log in to update your profile.");
      }
      
      // Only send fields that need updating
      const updateData = {
        phone: formData.phone,
        address: formData.address,
        status: formData.status
      };
      
      // Only include password if it was provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // Make API call
      const response = await axios.put(
        `http://localhost:8081/api/instructors/${instructor.ins_id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Check if update was successful
      if (response.status === 200) {
        // Get updated instructor data from response or create locally
        const updatedInstructor = response.data || {
          ...instructor,
          ...updateData,
          password: undefined // Remove password from displayed data
        };
        
        // Update instructor data in state
        setInstructor(updatedInstructor);
        
        // Reset password fields
        setFormData({
          ...formData,
          password: "",
          confirmPassword: ""
        });
        
        setIsEditing(false);
        showSuccessMessage();
        
        // Optionally refresh data from server to ensure we have latest
        fetchInstructorData();
      } else {
        throw new Error("Failed to update profile. Server response: " + response.status);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showErrorMessage("Failed to update profile: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // Get status display information
  const getStatusInfo = (statusValue) => {
    const status = statusOptions.find(option => option.value === statusValue) || 
                 { value: statusValue, label: statusValue, color: "#6b7280" };
    return status;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get vehicle category display name
  const getVehicleCategoryName = (category) => {
    const categories = {
      'van': 'Van',
      'bike': 'Motorcycle',
      'tricycle': 'Three-wheeler'
    };
    return categories[category] || category;
  };

  // Close modal and reset form data
  const closeModal = () => {
    setShowModal(false);
    setFormData({
      phone: instructor?.phone || "",
      address: instructor?.address || "",
      password: "",
      confirmPassword: "",
      status: instructor?.status || "available"
    });
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <InstructorSidebar />
        <main className="main-content">
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <InstructorSidebar />
        <main className="main-content">
          <div className={styles.errorContainer}>
            <AlertCircle size={48} />
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={fetchInstructorData}>
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Get current status info for display
  const currentStatus = getStatusInfo(instructor?.status || 'available');

  return (
    <div className="app-layout">
      <InstructorSidebar />
      <main className="main-content">
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <h1>My Profile</h1>            <div className={styles.headerActions}>
              <button 
                className={styles.editButton}
                onClick={() => setShowModal(true)}
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          </div>

          {updateSuccess && (
            <div className={styles.successAlert}>
              <div className={styles.successIcon}>✓</div>
              Profile updated successfully!
            </div>
          )}
          
          {updateError && (
            <div className={styles.errorAlert}>
              <div className={styles.errorIcon}>⚠</div>
              {updateError}
            </div>
          )}

          <div className={styles.profileCard}>
            <div className={styles.profileBasic}>
              <div className={styles.profileAvatar}>
                {instructor?.firstName?.charAt(0)}{instructor?.lastName?.charAt(0)}
              </div>
              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>
                  {instructor?.firstName} {instructor?.lastName}
                </h2>
                <div className={styles.profileMeta}>
                  <span className={styles.profileCategory}>
                    {getVehicleCategoryName(instructor?.vehicleCategory)} Instructor
                  </span>
                  <span 
                    className={styles.statusBadge} 
                    style={{ backgroundColor: currentStatus.color + '20', color: currentStatus.color }}
                  >
                    <Clock size={14} />
                    {currentStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <>
                <div className={styles.statusSection}>
                  <div className={styles.statusHeader}>
                    <h3>Update Your Status</h3>
                    <p className={styles.statusDescription}>
                      Let the school know about your availability by changing your status below
                    </p>
                  </div>
                  <div className={styles.statusButtons}>
                    {statusOptions.map(status => (
                      <button 
                        key={status.value}
                        className={`${styles.statusButton} ${instructor?.status === status.value ? styles.activeStatus : ''}`}
                        style={{ 
                          backgroundColor: instructor?.status === status.value ? status.color : 'transparent',
                          color: instructor?.status === status.value ? 'white' : status.color,
                          borderColor: status.color
                        }}
                        onClick={() => handleStatusChange(status.value)}
                        disabled={isUpdating}
                      >
                        {status.label}
                        {instructor?.status === status.value && (
                          <div className={styles.activeStatusIndicator}>
                            <span className={styles.activeStatusDot}></span>
                            Current
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.profileDetails}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailSection}>
                      <h3>Personal Information</h3>
                      
                      <div className={styles.detailItem}>
                        <Mail className={styles.detailIcon} size={18} />
                        <div>
                          <span className={styles.detailLabel}>Email</span>
                          <span className={styles.detailValue}>{instructor?.email}</span>
                        </div>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <Phone className={styles.detailIcon} size={18} />
                        <div>
                          <span className={styles.detailLabel}>Phone Number</span>
                          <span className={styles.detailValue}>{instructor?.phone}</span>
                        </div>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <User className={styles.detailIcon} size={18} />
                        <div>
                          <span className={styles.detailLabel}>NIC</span>
                          <span className={styles.detailValue}>{instructor?.nic}</span>
                        </div>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <Calendar className={styles.detailIcon} size={18} />
                        <div>
                          <span className={styles.detailLabel}>Birthday</span>
                          <span className={styles.detailValue}>{formatDate(instructor?.birthday)}</span>
                        </div>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <MapPin className={styles.detailIcon} size={18} />
                        <div>
                          <span className={styles.detailLabel}>Address</span>
                          <span className={styles.detailValue}>{instructor?.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.detailSection}>
                      <h3>Professional Information</h3>
                      
                      <div className={styles.detailItem}>
                        <User className={styles.detailIcon} size={18} />
                        <div>
                          <span className={styles.detailLabel}>License Number</span>
                          <span className={styles.detailValue}>{instructor?.licenseNo}</span>
                        </div>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <Truck className={styles.detailIcon} size={18} />
                        <div>
                          <span className={styles.detailLabel}>Vehicle Category</span>
                          <span className={styles.detailValue}>{getVehicleCategoryName(instructor?.vehicleCategory)}</span>
                        </div>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <Calendar className={styles.detailIcon} size={18} />
                        <div>
                          <span className={styles.detailLabel}>Joined Date</span>
                          <span className={styles.detailValue}>{formatDate(instructor?.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.editForm}>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.formSection}>
                      <h3>Update Profile Information</h3>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone Number</label>
                        <div className={styles.inputWithIcon}>
                          <Phone size={16} className={styles.inputIcon} />
                          <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="address">Address</label>
                        <div className={styles.inputWithIcon}>
                          <MapPin size={16} className={styles.inputIcon} />
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="status">Status</label>
                        <div className={styles.statusSelectContainer}>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={styles.statusSelect}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div 
                            className={styles.statusPreview}
                            style={{ backgroundColor: getStatusInfo(formData.status).color }}
                          ></div>
                        </div>
                        <p className={styles.statusHint}>
                          This will update your availability status
                        </p>
                      </div>
                    </div>
                    
                    <div className={styles.formSection}>
                      <h3>Change Password</h3>
                      <p className={styles.passwordNote}>Leave blank if you don't want to change</p>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="password">New Password</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      className={styles.cancelButton} 
                      onClick={() => setIsEditing(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles.saveButton}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Edit Profile</h4>
              <button 
                className={styles.closeButton} 
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Tab Navigation */}
              <div className={styles.modalTabs}>
                <button 
                  className={`${styles.modalTab} ${activeTab === 'personal' ? styles.active : ''}`}
                  onClick={() => setActiveTab('personal')}
                >
                  Personal Information
                </button>
                <button 
                  className={`${styles.modalTab} ${activeTab === 'security' ? styles.active : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  Security
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className={styles.modalFormGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={instructor?.firstName || ""}
                        readOnly
                        disabled
                        className={styles.readOnlyField}
                      />
                      <small className={styles.fieldNote}>Contact admin to change name</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={instructor?.lastName || ""}
                        readOnly
                        disabled
                        className={styles.readOnlyField}
                      />
                      <small className={styles.fieldNote}>Contact admin to change name</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address</label>
                      <div className={styles.inputWithIcon}>
                        <Mail size={16} className={styles.inputIcon} />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={instructor?.email || ""}
                          readOnly
                          disabled
                          className={styles.readOnlyField}
                        />
                      </div>
                      <small className={styles.fieldNote}>Contact admin to change email</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number</label>
                      <div className={styles.inputWithIcon}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="nic">NIC</label>
                      <input
                        type="text"
                        id="nic"
                        name="nic"
                        value={instructor?.nic || ""}
                        readOnly
                        disabled
                        className={styles.readOnlyField}
                      />
                      <small className={styles.fieldNote}>Contact admin to change NIC</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="licenseNo">License Number</label>
                      <input
                        type="text"
                        id="licenseNo"
                        name="licenseNo"
                        value={instructor?.licenseNo || ""}
                        readOnly
                        disabled
                        className={styles.readOnlyField}
                      />
                      <small className={styles.fieldNote}>Contact admin to change license number</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="vehicleCategory">Vehicle Category</label>
                      <input
                        type="text"
                        id="vehicleCategory"
                        name="vehicleCategory"
                        value={getVehicleCategoryName(instructor?.vehicleCategory) || ""}
                        readOnly
                        disabled
                        className={styles.readOnlyField}
                      />
                      <small className={styles.fieldNote}>Contact admin to change category</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="address">Address</label>
                      <div className={styles.inputWithIcon}>
                        <MapPin size={16} className={styles.inputIcon} />
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className={styles.modalFormGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="password">New Password</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                      />
                      <small className={styles.fieldNote}>Leave blank if you don't want to change</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <div className={styles.securityNotice}>
                      <h5>Password Requirements:</h5>
                      <ul>
                        <li>At least 8 characters long</li>
                        <li>Include at least one uppercase letter</li>
                        <li>Include at least one number</li>
                        <li>Include at least one special character</li>
                      </ul>
                    </div>
                  </div>
                )}
                <div className={styles.modalFooter}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={closeModal}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorProfile;