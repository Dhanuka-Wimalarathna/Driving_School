import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProfilePage.css";

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found");
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:8081/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudent(response.data);
        setEditStudent(response.data);
      } catch (error) {
        console.error("Error fetching student details:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete("http://localhost:8081/api/auth/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("authToken");
      setShowDeleteConfirm(false);
      navigate("/signup");
    } catch (error) {
      console.error("Error deleting account:", error.response?.data || error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleEditProfile = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    setEditStudent({ ...editStudent, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      
      // Transform the data to match backend expectations
      const dataToSend = {
        firstName: editStudent.FIRST_NAME,
        lastName: editStudent.LAST_NAME,
        email: editStudent.EMAIL,
        nic: editStudent.NIC,
        birthday: editStudent.BIRTHDAY ? editStudent.BIRTHDAY.split("T")[0] : "",
        address: editStudent.ADDRESS,
        phone: editStudent.PHONE
      };
      
      await axios.put("http://localhost:8081/api/auth/update", dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudent(editStudent);
      setShowModal(false);
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-layout">
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="profile-content">
          <div className="profile-wrapper">
            <div className="profile-header">
              <h1 className="page-title">
                <i className="bi bi-person-circle"></i>
                Student Profile
              </h1>
              <p className="page-subtitle">Manage your personal information and account settings</p>
            </div>

            <div className="profile-grid">
              {/* Personal Info Card */}
              <div className="profile-card info-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-person-badge"></i>
                    Personal Information
                  </h2>
                  <span className="profile-id">
                    Student ID: {student?.STU_ID || "N/A"}
                  </span>
                </div>
                <div className="card-body">
                  <div className="profile-overview">
                    <div className="profile-avatar">
                      <span>{student?.FIRST_NAME?.charAt(0)}{student?.LAST_NAME?.charAt(0)}</span>
                    </div>
                    <div className="profile-name">
                      <h3>{student?.FIRST_NAME} {student?.LAST_NAME}</h3>
                      <p>{student?.EMAIL}</p>
                    </div>
                  </div>
                  <div className="personal-info-section">
                    <div className="info-group">
                      <h4 className="info-section-title">Personal Details</h4>
                      <div className="info-item">
                        <span className="info-label">NIC</span>
                        <span className="info-value">{student?.NIC || "Not provided"}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Date of Birth</span>
                          <span className="info-value">{student?.BIRTHDAY ? student.BIRTHDAY.split("T")[0] : "Not provided"}</span>
                        </div>
                    </div>
  
                    <div className="info-group">
                      <h4 className="info-section-title">Contact Information</h4>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="bi bi-telephone"></i> Phone
                        </span>
                        <span className="info-value">{student?.PHONE || "Not provided"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="bi bi-envelope"></i> Email
                        </span>
                        <span className="info-value">{student?.EMAIL || "Not provided"}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="bi bi-geo-alt"></i> Address
                        </span>
                        <span className="info-value">{student?.ADDRESS || "Not provided"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions Card */}
              <div className="profile-card actions-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-gear"></i>
                    Account Actions
                  </h2>
                </div>
                <div className="card-body">
                  <div className="action-options">
                    <div className="action-option" onClick={handleEditProfile}>
                      <div className="action-icon">
                        <i className="bi bi-pencil-square"></i>
                      </div>
                      <div className="action-details">
                        <h4>Edit Profile</h4>
                        <p>Update your personal information</p>
                      </div>
                    </div>
                    
                    <div className="action-option" onClick={handleLogout}>
                      <div className="action-icon">
                        <i className="bi bi-box-arrow-right"></i>
                      </div>
                      <div className="action-details">
                        <h4>Logout</h4>
                        <p>Sign out from your account</p>
                      </div>
                    </div>
                    
                    <div className="action-option danger" onClick={() => setShowDeleteConfirm(true)}>
                      <div className="action-icon">
                        <i className="bi bi-trash"></i>
                      </div>
                      <div className="action-details">
                        <h4>Delete Account</h4>
                        <p>Permanently remove your account</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg" className="profile-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edit Your Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveChanges}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <Form.Control
                  type="text"
                  name="FIRST_NAME"
                  value={editStudent.FIRST_NAME || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <Form.Control
                  type="text"
                  name="LAST_NAME"
                  value={editStudent.LAST_NAME || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <Form.Control
                  type="email"
                  name="EMAIL"
                  value={editStudent.EMAIL || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">NIC</label>
                <Form.Control
                  type="text"
                  name="NIC"
                  value={editStudent.NIC || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <Form.Control
                  type="date"
                  name="BIRTHDAY"
                  value={editStudent.BIRTHDAY ? editStudent.BIRTHDAY.split("T")[0] : ""}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone</label>
                <Form.Control
                  type="text"
                  name="PHONE"
                  value={editStudent.PHONE || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label className="form-label">Address</label>
                <Form.Control
                  type="text"
                  name="ADDRESS"
                  value={editStudent.ADDRESS || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <Button 
                variant="primary" 
                type="submit" 
                className="save-button"
              >
                <i className="bi bi-check-circle"></i>
                Save Changes
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={handleCloseModal}
                className="cancel-button"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered className="delete-modal">
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="delete-modal-content">
            <div className="delete-warning-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h4>Are you sure you want to delete your account?</h4>
            <p>This action cannot be undone and all your data will be permanently removed.</p>
            
            <div className="delete-modal-actions">
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount}
                className="confirm-delete-button"
              >
                <i className="bi bi-trash"></i>
                Yes, Delete My Account
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Success Toast */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="toast-content">
            <h4>Success!</h4>
            <p>Profile updated successfully</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;