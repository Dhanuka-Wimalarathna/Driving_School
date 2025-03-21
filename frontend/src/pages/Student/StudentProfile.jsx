import React, { useState } from 'react';
import './StudentProfile.css';

const StudentProfile = () => {
  const [student, setStudent] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+1234567890',
    profilePic: 'https://via.placeholder.com/150',
  });

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img src={student.profilePic} alt="Profile" className="profile-pic" />
          <h2>{student.name}</h2>
          <p>{student.email}</p>
        </div>
        <div className="profile-details">
          <h3>Contact Information</h3>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Email:</strong> {student.email}</p>
        </div>
        <div className="profile-actions">
          <button className="btn-edit">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
