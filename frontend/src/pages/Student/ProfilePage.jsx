import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./ProfilePage.css";
import "./EditProfile.css"; // Import modal styles

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State to show/hide the modal
  const [editStudent, setEditStudent] = useState({}); // State for editable form data
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
        setEditStudent(response.data); // Initialize editable data
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
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete("http://localhost:8081/api/auth/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("authToken");
      navigate("/signup");
    } catch (error) {
      console.error("Error deleting account:", error.response?.data || error);
      alert("Failed to delete account. Please try again.");
    }
  };

  // Handle Edit Profile Modal
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

    console.log("Data being sent:", dataToSend); // For debugging
    
    await axios.put("http://localhost:8081/api/auth/update", dataToSend, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Profile updated successfully!");
    setStudent(editStudent);
    setShowModal(false);
  } catch (error) {
    console.error("Error updating profile:", error.response?.data || error);
    alert("Failed to update profile. Please try again.");
  }
};

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Sidebar />
      <main className="profile-content">
        <header className="profile-header">
          <h1>Student Profile</h1>
        </header>

        <section className="profile-card">
          <h2>Personal Information</h2>
          {student ? (
            <div className="profile-details">
              <p><strong>Full Name:</strong> {student.FIRST_NAME} {student.LAST_NAME}</p>
              <p><strong>Email:</strong> {student.EMAIL}</p>
              <p><strong>NIC:</strong> {student.NIC}</p>
              <p><strong>Date of Birth:</strong> {student.BIRTHDAY ? student.BIRTHDAY.split("T")[0] : "N/A"}</p>
              <p><strong>Address:</strong> {student.ADDRESS}</p>
              <p><strong>Phone:</strong> {student.PHONE}</p>
            </div>
          ) : (
            <p className="no-data">No student data available.</p>
          )}
        </section>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="edit-btn" onClick={handleEditProfile}>Edit Profile</button>
          <button className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSaveChanges}>
              <label>First Name:</label>
              <input type="text" name="FIRST_NAME" value={editStudent.FIRST_NAME} onChange={handleChange} required />

              <label>Last Name:</label>
              <input type="text" name="LAST_NAME" value={editStudent.LAST_NAME} onChange={handleChange} required />

              <label>Email:</label>
              <input type="email" name="EMAIL" value={editStudent.EMAIL} onChange={handleChange} required />

              <label>NIC:</label>
              <input type="text" name="NIC" value={editStudent.NIC} onChange={handleChange} required />

              <label>Date of Birth:</label>
              <input type="date" name="BIRTHDAY" value={editStudent.BIRTHDAY ? editStudent.BIRTHDAY.split("T")[0] : ""} onChange={handleChange} required />

              <label>Address:</label>
              <input type="text" name="ADDRESS" value={editStudent.ADDRESS} onChange={handleChange} required />

              <label>Phone:</label>
              <input type="text" name="PHONE" value={editStudent.PHONE} onChange={handleChange} required />

              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
