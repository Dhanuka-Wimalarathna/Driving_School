import React, { useState } from 'react';
import './InstructorDashboard.css';
import InstructorSidebar from '../components/Sidebar/InstructorSidebar';

function InstructorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Sample instructor data
  const instructorsData = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      courses: ['Defensive Driving', 'Night Driving'],
      totalStudents: 65,
      rating: 4.8,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Mike Thompson',
      email: 'mike.thompson@example.com',
      courses: ['Highway Driving', 'Commercial Driving'],
      totalStudents: 48,
      rating: 4.5,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      courses: ['Beginner Driving', 'Teen Driving'],
      totalStudents: 52,
      rating: 4.7,
      status: 'Inactive'
    }
  ];

  return (
    <div className="dashboard-layout">
      <InstructorSidebar 
        sidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
      />

      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <header className="header">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search instructors..." 
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="header-right">
            <div className="notification">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">2</span>
            </div>
            <div className="user-menu">
              <img 
                src="https://via.placeholder.com/40" 
                alt="User" 
                className="user-avatar" 
              />
              <span className="user-name">Admin User</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content instructors-page">
          <div className="page-title">
            <h1>Instructors Management</h1>
            <button className="add-instructor-btn">+ Add Instructor</button>
          </div>

          <div className="instructors-stats-grid">
            <div className="stat-card primary">
              <div className="stat-info">
                <h3 className="stat-title">Total Instructors</h3>
                <p className="stat-value">{instructorsData.length}</p>
                <p className="stat-change positive">↑ 10% from last month</p>
              </div>
              <div className="stat-icon">👨‍🏫</div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-info">
                <h3 className="stat-title">Active Instructors</h3>
                <p className="stat-value">
                  {instructorsData.filter(i => i.status === 'Active').length}
                </p>
                <p className="stat-change positive">↑ 5% from last month</p>
              </div>
              <div className="stat-icon">✅</div>
            </div>
            
            <div className="stat-card warning">
              <div className="stat-info">
                <h3 className="stat-title">Average Rating</h3>
                <p className="stat-value">
                  {(instructorsData.reduce((sum, i) => sum + i.rating, 0) / instructorsData.length).toFixed(1)}
                </p>
                <p className="stat-change positive">↑ 0.2 from last month</p>
              </div>
              <div className="stat-icon">⭐</div>
            </div>
          </div>

          <div className="instructors-grid">
            {instructorsData.map(instructor => (
              <div 
                key={instructor.id} 
                className={`instructor-card ${selectedInstructor?.id === instructor.id ? 'selected' : ''}`}
                onClick={() => setSelectedInstructor(instructor)}
              >
                <div className="instructor-header">
                  <div className={`status-indicator ${instructor.status.toLowerCase()}`}>
                    {instructor.status}
                  </div>
                </div>
                <div className="instructor-content">
                  <h3 className="instructor-name">{instructor.name}</h3>
                  <p className="instructor-email">{instructor.email}</p>
                  <div className="instructor-stats">
                    <div className="stat">
                      <span className="stat-label">Courses</span>
                      <span className="stat-value">{instructor.courses.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Students</span>
                      <span className="stat-value">{instructor.totalStudents}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Rating</span>
                      <span className="stat-value">{instructor.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedInstructor && (
            <div className="instructor-details-sidebar">
              <div className="details-header">
                <h2>Instructor Details</h2>
                <button 
                  className="close-details-btn"
                  onClick={() => setSelectedInstructor(null)}
                >
                  ✕
                </button>
              </div>
              <div className="details-content">
                <div className={`status-badge ${selectedInstructor.status.toLowerCase()}`}>
                  {selectedInstructor.status}
                </div>
                <h3 className="instructor-name">{selectedInstructor.name}</h3>
                <p className="instructor-email">{selectedInstructor.email}</p>
                
                <div className="details-section">
                  <h4>Courses</h4>
                  <ul>
                    {selectedInstructor.courses.map((course, index) => (
                      <li key={index}>{course}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="details-section">
                  <h4>Performance Metrics</h4>
                  <div className="performance-grid">
                    <div className="performance-item">
                      <span className="label">Total Students</span>
                      <span className="value">{selectedInstructor.totalStudents}</span>
                    </div>
                    <div className="performance-item">
                      <span className="label">Rating</span>
                      <span className="value">{selectedInstructor.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="details-actions">
                  <button className="action-btn edit">Edit Profile</button>
                  <button className="action-btn toggle-status">
                    {selectedInstructor.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;