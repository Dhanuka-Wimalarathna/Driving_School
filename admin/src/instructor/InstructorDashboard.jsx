import React, { useState, useEffect } from 'react';
import './InstructorDashboard.css';
import InstructorSidebar from '../components/Sidebar/InstructorSidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function InstructorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Single declaration of toggleSidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/instructor/sign-in');
          return;
        }
    
        const response = await axios.get('http://localhost:8081/api/instructors/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        // Remove the .instructor check since data is at root level
        if (!response.data) {
          throw new Error('No instructor data received');
        }
    
        setInstructor(response.data); // Set the entire response data
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error('Error fetching instructor:', err);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/instructor/sign-in');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <p className="error-message">{error}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="error-screen">
        <p className="error-message">Instructor data not available</p>
        <button 
          className="retry-btn"
          onClick={() => navigate('/instructor/sign-in')}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <InstructorSidebar 
        sidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        instructorName={instructor.firstName + ' ' + instructor.lastName}
      />

      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <header className="header">
          <div className="welcome-message">
            <h2>Welcome back, {instructor.firstName}!</h2>
            <p>Here's your teaching overview</p>
          </div>
          <div className="header-right">
            <div className="notification">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">2</span>
            </div>
            <div className="user-menu">
              <img 
                src={`https://ui-avatars.com/api/?name=${instructor.firstName}+${instructor.lastName}&background=random`} 
                alt="User" 
                className="user-avatar" 
              />
              <span className="user-name">{instructor.firstName} {instructor.lastName}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content instructor-dashboard">
          <div className="performance-stats">
            <div className="stat-card">
              <div className="stat-icon">👨‍🎓</div>
              <div className="stat-info">
                <h3>Total Students</h3>
                <p className="stat-value">42</p>
                <p className="stat-change positive">↑ 5 this month</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>Scheduled Lessons</h3>
                <p className="stat-value">8</p>
                <p className="stat-change">Next: Tomorrow 10AM</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>Your Rating</h3>
                <p className="stat-value">4.8</p>
                <p className="stat-change positive">↑ 0.1 this month</p>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <section className="upcoming-lessons">
              <h3>Upcoming Lessons</h3>
              <div className="lesson-list">
                <div className="lesson-item">
                  <div className="lesson-time">Mon, 10:00 AM</div>
                  <div className="lesson-details">
                    <h4>Beginner Driving</h4>
                    <p>Student: John Smith</p>
                  </div>
                </div>
                <div className="lesson-item">
                  <div className="lesson-time">Tue, 2:00 PM</div>
                  <div className="lesson-details">
                    <h4>Defensive Driving</h4>
                    <p>Student: Sarah Johnson</p>
                  </div>
                </div>
              </div>
              <button className="view-all-btn">View All Lessons</button>
            </section>

            <section className="recent-students">
              <h3>Recent Students</h3>
              <div className="student-list">
                <div className="student-item">
                  <img 
                    src="https://ui-avatars.com/api/?name=John+Smith" 
                    alt="Student" 
                    className="student-avatar" 
                  />
                  <div className="student-info">
                    <h4>John Smith</h4>
                    <p>3 lessons completed</p>
                  </div>
                </div>
                <div className="student-item">
                  <img 
                    src="https://ui-avatars.com/api/?name=Sarah+Johnson" 
                    alt="Student" 
                    className="student-avatar" 
                  />
                  <div className="student-info">
                    <h4>Sarah Johnson</h4>
                    <p>5 lessons completed</p>
                  </div>
                </div>
              </div>
              <button className="view-all-btn">View All Students</button>
            </section>
          </div>

          <section className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn">
                <span className="action-icon">➕</span>
                Schedule New Lesson
              </button>
              <button className="action-btn">
                <span className="action-icon">📝</span>
                Update Availability
              </button>
              <button className="action-btn">
                <span className="action-icon">📊</span>
                View Performance
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;