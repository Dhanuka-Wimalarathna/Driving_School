import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { User, Mail, Phone, Trash2, UserCheck, AlertCircle, Calendar, MapPin, Truck, X, CheckCircle } from "lucide-react";
import styles from "./Instructor.module.css";

const Instructor = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState(null);
  // Add toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success or error
  const navigate = useNavigate();

  // Status options for instructors
  const statusOptions = [
    { value: "available", label: "Available", color: "#10b981" }, // green
    { value: "busy", label: "Busy", color: "#f59e0b" },          // amber
    { value: "unavailable", label: "Unavailable", color: "#ef4444" }, // red
    { value: "on_leave", label: "On Leave", color: "#6366f1" }   // indigo
  ];

  // Fetch instructors when component mounts
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/sign-in');
      return;
    }
    
    // Fetch instructor data
    fetchInstructors();
  }, [navigate]);

  // Effect to hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Function to fetch instructors from API
  const fetchInstructors = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get("http://localhost:8081/api/instructors");
      const mappedInstructors = response.data.map((instructor) => ({
        id: instructor.ins_id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        phone: instructor.phone,
        licenseNo: instructor.licenseNo,
        nic: instructor.nic,
        birthday: instructor.birthday,
        address: instructor.address,
        vehicleCategory: instructor.vehicleCategory,
        status: instructor.status || "available", // Default to 'available' if status is not provided
        created_at: instructor.created_at
      }));
      setInstructors(mappedInstructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setErrorMessage("Failed to load instructor data. Please try again later.");
      setInstructors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle delete button click
  const handleDeleteClick = (instructor) => {
    setInstructorToDelete(instructor);
    setShowDeleteModal(true);
  };

  // Function to cancel delete operation
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setInstructorToDelete(null);
  };

  // Function to show toast notification
  const showToastNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Function to confirm and delete an instructor
  const confirmDelete = async () => {
    if (!instructorToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8081/api/instructors/${instructorToDelete.id}`);
      setInstructors(instructors.filter((instructor) => instructor.id !== instructorToDelete.id));
      setShowDeleteModal(false);
      setInstructorToDelete(null);
      
      // Show success toast notification
      showToastNotification(`${instructorToDelete.firstName} ${instructorToDelete.lastName} has been successfully deleted.`);
    } catch (error) {
      console.error("Error deleting instructor:", error);
      // Show error toast notification
      showToastNotification("Failed to delete instructor. Please try again.", "error");
    }
  };

  // Toggle card expansion
  const toggleCardExpansion = (instructorId) => {
    setExpandedCards(prev => ({
      ...prev,
      [instructorId]: !prev[instructorId]
    }));
  };

  // Get vehicle category icon
  const getVehicleIcon = (category) => {
    switch(category) {
      case 'van':
        return <Truck size={16} />;
      case 'bike':
        return <UserCheck size={16} />;
      case 'tricycle':
        return <UserCheck size={16} />;
      default:
        return <Truck size={16} />;
    }
  };

  // Get status display information
  const getStatusInfo = (statusValue) => {
    const status = statusOptions.find(option => option.value === statusValue) || 
                 { value: statusValue, label: statusValue, color: "#6b7280" };
    return status;
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="page-container">
          <div className={styles['instructors-container']}>
            <header className={styles['instructors-header']}>
              <div className={styles['header-title']}>
                <h1>
                  <span className={styles['title-icon']}>
                    <UserCheck size={24} />
                  </span>
                  Instructors
                </h1>
                <p className={styles.subtitle}>
                  {instructors.length} {instructors.length === 1 ? "instructor" : "instructors"} registered
                </p>
              </div>
            </header>

            {isLoading ? (
              <div className={styles['loading-container']}>
                <div className={styles['loading-spinner']}></div>
                <p>Loading instructors data...</p>
              </div>
            ) : errorMessage ? (
              <div className={styles['error-container']}>
                <AlertCircle size={24} />
                <p>{errorMessage}</p>
                <button className={styles['retry-btn']} onClick={fetchInstructors}>Retry</button>
              </div>
            ) : (
              <>
                {instructors.length > 0 ? (
                  <div className={styles['instructor-cards-container']}>
                    {instructors.map((instructor) => (
                      <div key={instructor.id} className={`${styles['instructor-card']} ${expandedCards[instructor.id] ? styles['expanded'] : ''}`}>
                        <div className={styles['instructor-card-header']}>
                          <div className={styles['instructor-avatar']}>
                            {instructor.firstName.charAt(0)}{instructor.lastName.charAt(0)}
                          </div>
                          <div className={styles['instructor-basic-details']}>
                            <h3 className={styles['instructor-name']}>{instructor.firstName} {instructor.lastName}</h3>
                            
                            <div className={styles['instructor-info']}>
                              <Mail size={16} className={styles['info-icon']} />
                              <span className={styles['info-text']}>{instructor.email}</span>
                            </div>
                            
                            <div className={styles['instructor-info']}>
                              <Phone size={16} className={styles['info-icon']} />
                              <span className={styles['info-text']}>{instructor.phone}</span>
                            </div>
                            
                            <div className={styles['instructor-actions']}>
                              <button 
                                className={styles['view-btn']}
                                onClick={() => toggleCardExpansion(instructor.id)}
                              >
                                {expandedCards[instructor.id] ? 'Hide Details' : 'Show Details'}
                              </button>
                              <button 
                                className={styles['delete-btn']}
                                onClick={() => handleDeleteClick(instructor)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Status badge positioned at the top right */}
                          <div className={styles['status-container']}>
                            <span 
                              className={styles['status-badge']}
                              style={{ backgroundColor: getStatusInfo(instructor.status).color }}
                            >
                              {getStatusInfo(instructor.status).label}
                            </span>
                          </div>
                        </div>
                        
                        {expandedCards[instructor.id] && (
                          <div className={styles['instructor-details-expanded']}>
                            {/* Expanded card content remains the same */}
                            <div className={styles['instructor-category-badge']}>
                              Vehicle: <span>{instructor.vehicleCategory}</span>
                            </div>
                            
                            <div className={styles['detail-sections']}>
                              <div className={styles['detail-section']}>
                                <h4>Personal Information</h4>
                                
                                <div className={styles['detail-item']}>
                                  <User size={16} className={styles['detail-icon']} />
                                  <div>
                                    <span className={styles['detail-label']}>NIC</span>
                                    <span className={styles['detail-value']}>{instructor.nic}</span>
                                  </div>
                                </div>
                                
                                <div className={styles['detail-item']}>
                                  <Calendar size={16} className={styles['detail-icon']} />
                                  <div>
                                    <span className={styles['detail-label']}>Birthday</span>
                                    <span className={styles['detail-value']}>{formatDate(instructor.birthday)}</span>
                                  </div>
                                </div>
                                
                                <div className={styles['detail-item']}>
                                  <MapPin size={16} className={styles['detail-icon']} />
                                  <div>
                                    <span className={styles['detail-label']}>Address</span>
                                    <span className={styles['detail-value']}>{instructor.address}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className={styles['detail-section']}>
                                <h4>Professional Information</h4>
                                
                                <div className={styles['detail-item']}>
                                  <User size={16} className={styles['detail-icon']} />
                                  <div>
                                    <span className={styles['detail-label']}>License Number</span>
                                    <span className={styles['detail-value']}>{instructor.licenseNo}</span>
                                  </div>
                                </div>
                                
                                <div className={styles['detail-item']}>
                                  <Truck size={16} className={styles['detail-icon']} />
                                  <div>
                                    <span className={styles['detail-label']}>Vehicle Category</span>
                                    <span className={styles['detail-value']}>{instructor.vehicleCategory}</span>
                                  </div>
                                </div>
                                
                                <div className={styles['detail-item']}>
                                  <Calendar size={16} className={styles['detail-icon']} />
                                  <div>
                                    <span className={styles['detail-label']}>Joined Date</span>
                                    <span className={styles['detail-value']}>{formatDate(instructor.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles['no-instructors-container']}>
                    <div className={styles['no-data']}>
                      <UserCheck size={64} />
                      <h3>No Instructors Found</h3>
                      <p>There are no instructors registered in the system yet</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && instructorToDelete && (
        <div className={styles['modal-overlay']}>
          <div className={styles['delete-confirmation-modal']}>
            <div className={styles['delete-modal-header']}>
              <h3>Confirm Deletion</h3>
              <button className={styles['close-btn']} onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className={styles['delete-modal-content']}>
              <div className={styles['delete-warning-icon']}>
                <AlertCircle size={48} />
              </div>
              <p className={styles['delete-confirmation-message']}>
                Are you sure you want to delete instructor <strong>{instructorToDelete.firstName} {instructorToDelete.lastName}</strong>?
              </p>
              <p className={styles['delete-warning']}>
                This action cannot be undone. All data related to this instructor will be permanently removed.
              </p>
            </div>
            <div className={styles['delete-modal-actions']}>
              <button className={styles['cancel-btn']} onClick={cancelDelete}>
                Cancel
              </button>
              <button className={styles['confirm-delete-btn']} onClick={confirmDelete}>
                <Trash2 size={16} />
                Delete Instructor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`${styles['toast-notification']} ${styles[toastType]}`}>
          <div className={styles['toast-icon']}>
            {toastType === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Instructor;