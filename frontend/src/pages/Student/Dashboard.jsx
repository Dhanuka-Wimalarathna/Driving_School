import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
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
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Welcome back, <span className="highlight">{student ? student.FIRST_NAME : "Student"}</span>
            </h1>
            <p className="dashboard-subtitle">Your driving progress overview</p>
          </div>
          <button className="view-profile-button" onClick={handleViewProfile}>
            <span className="icon">👤</span> View Profile
          </button>
        </header>

        <div className="dashboard-grid">
          <section className="dashboard-card profile-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="card-icon">👤</span>
                Student Profile
              </h2>
            </div>
            <div className="card-content">
              {student ? (
                <div className="profile-details">
                  <div className="detail-row">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{student.FIRST_NAME} {student.LAST_NAME}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{student.EMAIL}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">NIC</span>
                    <span className="detail-value">{student.NIC}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date of Birth</span>
                    <span className="detail-value">{student.BIRTHDAY ? student.BIRTHDAY.split("T")[0] : "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{student.ADDRESS}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{student.PHONE}</span>
                  </div>
                </div>
              ) : (
                <p className="no-data">Unable to load student data</p>
              )}
            </div>
          </section>

          <section className="dashboard-card lessons-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="card-icon">📅</span>
                Upcoming Lessons
              </h2>
            </div>
            <div className="card-content">
              <div className="empty-state">
                <p>No upcoming lessons scheduled</p>
                <button className="text-button" onClick={handleBookLesson}>
                  Book new lesson →
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;