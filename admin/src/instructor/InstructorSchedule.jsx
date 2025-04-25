import React, { useState, useEffect } from "react";
import { Eye, Edit, Calendar, Clock, Car, User, AlertCircle } from "lucide-react";
import "./InstructorSchedule.css";
import InstructorSidebar from "../components/Sidebar/InstructorSidebar";

const InstructorSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const instructorId = localStorage.getItem("instructorId");

  useEffect(() => {
    if (!instructorId) {
      setError("Instructor ID is missing. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
    
      try {
        const response = await fetch(`http://localhost:8081/api/booking/schedule/${instructorId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        
        // Transform data to ensure consistent structure
        const formattedData = data.map(item => ({
          id: item.id,
          date: item.date,
          timeSlot: item.timeSlot || '-',
          vehicle: item.vehicle || '-',
          studentName: item.studentName || '-',
          status: item.status || 'Unknown'
        }));
        
        setSchedule(formattedData);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [instructorId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboard-layout">
      <InstructorSidebar />
      <main className="schedule-main-content">
        <div className="schedule-container">
          <header className="schedule-header">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <Calendar size={24} />
                </span>
                My Schedule
              </h1>
              <p className="subtitle">
                {schedule.length} {schedule.length === 1 ? "lesson" : "lessons"} scheduled
              </p>
            </div>
          </header>

          {error ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <p>{error}</p>
              <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading schedule...</p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="empty-schedule">
              <Calendar size={48} />
              <h3>No Lessons Scheduled</h3>
              <p>You don't have any lessons scheduled at the moment.</p>
            </div>
          ) : (
            <div className="schedule-cards-container">
              {schedule.map((lesson) => (
                <div key={lesson.id} className={`schedule-card status-${lesson.status.toLowerCase()}`}>
                  <div className="card-header">
                    <div className="lesson-status">
                      <span className={`status-badge ${lesson.status.toLowerCase()}`}>
                        {lesson.status}
                      </span>
                    </div>
                    <div className="lesson-actions">
                      <button className="action-btn view-btn" title="View details">
                        <Eye size={16} />
                      </button>
                      <button className="action-btn edit-btn" title="Edit booking">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="lesson-info">
                      <div className="info-item">
                        <Calendar size={16} className="info-icon" />
                        <span className="info-label">Date:</span>
                        <span className="info-value">{formatDate(lesson.date)}</span>
                      </div>
                      
                      <div className="info-item">
                        <Clock size={16} className="info-icon" />
                        <span className="info-label">Time:</span>
                        <span className="info-value">{lesson.timeSlot}</span>
                      </div>
                      
                      <div className="info-item">
                        <User size={16} className="info-icon" />
                        <span className="info-label">Student:</span>
                        <span className="info-value">{lesson.studentName}</span>
                      </div>
                      
                      <div className="info-item">
                        <Car size={16} className="info-icon" />
                        <span className="info-label">Vehicle:</span>
                        <span className="info-value">{lesson.vehicle}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstructorSchedule;