import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import "./StudentDetails.css";

const StudentDetails = () => {
  const location = useLocation();
  const { student } = location.state || {};

  if (!student) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <div className="student-details">
            <h2>Student not found</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="student-details">
          <h2>Student Details</h2>
          <div className="detail-section">
            <h4>Personal Information</h4>
            <p><strong>ID:</strong> {student.id}</p>
            <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Phone:</strong> {student.phone || "N/A"}</p>
            <p><strong>Date of Birth:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>Address:</strong> {student.address}</p>
            <p><strong>Joined:</strong> {new Date(student.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="detail-section">
            <h4>Selected Package</h4>
            {student.selectedPackage && student.selectedPackage !== "None" ? (
              <p><strong>Title:</strong> {student.selectedPackage}</p>
            ) : (
              <p>No package selected</p>
            )}
          </div>

          <div className="detail-actions">
            <button className="history-btn">Academic History</button>
            <button className="contact-btn">Contact Student</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDetails;
