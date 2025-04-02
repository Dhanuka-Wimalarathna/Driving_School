import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const Dashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
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
      } catch (error) {
        console.error("Error fetching student details:", error.response?.data || error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [navigate]);

  const handleBookLesson = () => {
    navigate("/student/booking");
  };

  const handleViewProfile = () => {
    navigate("/student/profile");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          <div className="dashboard-wrapper">
            <div className="dashboard-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-house-door"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">
                    Welcome back, {student?.FIRST_NAME || "Student"}
                  </h1>
                  <p className="page-subtitle">Your driving progress overview</p>
                </div>
              </div>
              {/* <div className="header-actions">
                <button className="header-button" onClick={handleBookLesson}>
                  <i className="bi bi-plus-circle"></i>
                  Quick Book
                </button>
              </div> */}
            </div>

            <div className="dashboard-grid">
              {/* Profile Card */}
              <div className="dashboard-card profile-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-person-circle"></i>
                    Student Profile
                  </h2>
                  <button className="action-button" onClick={handleViewProfile}>
                    <i className="bi bi-pencil-square"></i>
                    Edit Profile
                  </button>
                </div>
                <div className="card-body">
                  {student ? (
                    <div className="profile-grid">
                      <div className="profile-item">
                        <div className="item-label">Full Name</div>
                        <div className="item-value">{student.FIRST_NAME} {student.LAST_NAME}</div>
                      </div>
                      <div className="profile-item">
                        <div className="item-label">Email</div>
                        <div className="item-value">{student.EMAIL}</div>
                      </div>
                      <div className="profile-item">
                        <div className="item-label">NIC</div>
                        <div className="item-value">{student.NIC}</div>
                      </div>
                      <div className="profile-item">
                        <div className="item-label">Date of Birth</div>
                        <div className="item-value">
                          {student.BIRTHDAY ? new Date(student.BIRTHDAY).toLocaleDateString("en-CA") : "N/A"}
                        </div>
                      </div>
                      <div className="profile-item full-width">
                        <div className="item-label">Address</div>
                        <div className="item-value">{student.ADDRESS}</div>
                      </div>
                      <div className="profile-item">
                        <div className="item-label">Phone</div>
                        <div className="item-value">{student.PHONE}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>Unable to load student data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Lessons Card */}
              <div className="dashboard-card lessons-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-calendar-check"></i>
                    Upcoming Lessons
                  </h2>
                </div>
                <div className="card-body">
                  <div className="empty-lessons">
                    <div className="empty-icon">
                      <i className="bi bi-calendar-x"></i>
                    </div>
                    <h3 className="empty-title">No upcoming lessons</h3>
                    <p className="empty-subtitle">Book your first driving lesson now</p>
                    <button className="confirm-button active" onClick={handleBookLesson}>
                      <i className="bi bi-plus-circle"></i>
                      Book New Lesson
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;