import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Progress.css';

const Progress = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const studentId = user?.id;
  const authToken = localStorage.getItem('authToken');

  // Fetch progress data from backend
  useEffect(() => {
    if (!studentId) {
      setError('Student ID not found - Please log in again');
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/session/progress/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        setSummary(response.data.summary);
        setLoading(false);
      } catch (err) {
        setError('Failed to load progress data. Please try again later.');
        setLoading(false);
      }
    };

    fetchProgress();
  }, [studentId, authToken]);

  const calculatePercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (!studentId) {
    return (
      <div className="error-container">
        <h2>Authentication Required</h2>
        <p>Please log in to view your progress</p>
      </div>
    );
  }

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading progress data...</p>
    </div>
  );

  if (error) return (
    <div className="alert alert-error">
      <div className="alert-icon">!</div>
      <div className="alert-content">{error}</div>
    </div>
  );

  return (
    <div className="progress-container">
      <div className="progress-layout">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        <div className="progress-content">
          <div className="progress-wrapper">
            <div className="progress-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">Training Progress</h1>
                  <p className="page-subtitle">Vehicle-wise session tracking</p>
                </div>
              </div>
            </div>

            <div className="progress-grid">
              {summary.map(vehicle => {
                const progress = calculatePercentage(
                  vehicle.completedSessions,
                  vehicle.totalSessions
                );

                return (
                  <div className="progress-card vehicle-card" key={vehicle.vehicle_id}>
                    <div className="card-header">
                      <h2 className="card-title">
                        <i className="bi bi-vehicle-type"></i>
                        {vehicle.vehicle_type} Sessions
                      </h2>
                    </div>
                    <div className="card-body">
                      <div className="progress-bar-container">
                        <div className="progress-bar-background">
                          <div 
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                          >
                            <span className="progress-percentage">{progress}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="session-metrics">
                        <div className="metric-box completed">
                          <span className="metric-label">Completed</span>
                          <span className="metric-value">{vehicle.completedSessions}</span>
                        </div>
                        <div className="metric-box remaining">
                          <span className="metric-label">Remaining</span>
                          <span className="metric-value">{vehicle.remainingSessions}</span>
                        </div>
                        <div className="metric-box total">
                          <span className="metric-label">Total</span>
                          <span className="metric-value">{vehicle.totalSessions}</span>
                        </div>
                      </div>

                      <div className="progress-status">
                        {progress === 100 ? (
                          <div className="status-indicator status-complete">
                            <i className="bi bi-check-circle"></i>
                            <span>Training Completed</span>
                          </div>
                        ) : (
                          <div className="status-indicator status-in-progress">
                            <i className="bi bi-arrow-repeat"></i>
                            <span>Training In Progress</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;