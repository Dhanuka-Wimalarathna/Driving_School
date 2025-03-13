import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LessonCard from '../../components/Student/LessonCard';
import Sidebar from '../../components/Sidebar';
import Notification from './Notification'; // Import the new Notification component
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import '../../components/Sidebar.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Sample upcoming lessons data
  const [upcomingLessons] = React.useState([
    {
      id: 1,
      date: "2023-10-05",
      instructor: "Mr. Smith",
      vehicle: "Toyota Corolla",
      status: "Upcoming"
    },
  ]);

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your lesson tomorrow has been confirmed",
      date: "2023-10-04",
      read: false,
      type: "confirmation"
    },
    {
      id: 2,
      message: "Instructor Mr. Smith has left you feedback",
      date: "2023-10-03",
      read: true,
      type: "feedback"
    },
    {
      id: 3,
      message: "You've completed 3 lessons so far!",
      date: "2023-10-02",
      read: true,
      type: "achievement"
    }
  ]);

  // State to handle notification dropdown
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleBookLesson = () => {
    navigate('/student/booking');
  };

  // Toggle notification panel
  const toggleNotifications = () => {
    setNotificationOpen(!notificationOpen);
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        
        {/* Main content */}
        <div className="dashboard-content">
          <div className="content-wrapper">
            {/* Header with greeting and quick stats */}
            <div className="dashboard-header">
              <div className="greeting-section">
                <h1 className="welcome-header">
                  Welcome back, <span className="user-name">{user?.name || 'Student'}</span>
                </h1>
                <p className="greeting-subtitle">Here's your driving progress overview</p>
              </div>
              
              <div className="quick-actions">
                {/* Notification Bell */}
                <Notification 
                  notifications={notifications}
                  markAsRead={markAsRead}
                  unreadCount={unreadCount}
                  notificationOpen={notificationOpen}
                  toggleNotifications={toggleNotifications}
                />
                
                <button 
                  className="action-button book-lesson"
                  onClick={handleBookLesson}
                >
                  <i className="bi bi-calendar-plus"></i>
                  Book New Lesson
                </button>
              </div>
            </div>
            
            {/* Main dashboard grid */}
            <div className="dashboard-grid">
              {/* Student Details Card */}
              <div className="card student-details-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-person-circle"></i>
                    Student Details
                  </h2>
                </div>
                <div className="card-body">
                  <div className="student-info">
                    <div className="info-item">
                      <span className="info-label">Name</span>
                      <span className="info-value">{user?.name || 'John Doe'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{user?.email || 'john.doe@example.com'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{user?.phone || '123-456-7890'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">License Type</span>
                      <span className="info-value">{user?.licenseType || 'Class B'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upcoming Lessons Section */}
              <div className="card lessons-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-calendar-check"></i>
                    Upcoming Lessons
                  </h2>
                  <button className="view-all-btn" onClick={handleBookLesson}>
                    View All
                  </button>
                </div>
                <div className="card-body">
                  {upcomingLessons.length > 0 ? (
                    <div className="lesson-grid">
                      {upcomingLessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          className="lesson-card"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="no-lessons">
                      <i className="bi bi-calendar-x"></i>
                      <p>No upcoming lessons scheduled</p>
                      <button 
                        className="action-button book-lesson-small"
                        onClick={handleBookLesson}
                      >
                        Book Your First Lesson
                      </button>
                    </div>
                  )}
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