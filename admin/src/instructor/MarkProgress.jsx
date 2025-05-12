import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './MarkProgress.css';
import InstructorSidebar from "../components/Sidebar/InstructorSidebar";

const MarkProgress = () => {
  const { id } = useParams();
  const location = useLocation();
  const student = location.state?.student || {};
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMarkingProgress, setIsMarkingProgress] = useState(false);

  // Fetch progress summary data with cache busting
  useEffect(() => {
    fetchProgress();
  }, [id]);

  const fetchProgress = () => {
    setLoading(true);
    axios.get(`http://localhost:8081/api/session/progress/${id}?t=${Date.now()}`)
      .then(res => {
        setSummary(res.data?.summary || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching progress:", err);
        setErrorMessage(err.response?.data?.error || "Failed to load progress data. Please try again.");
        setLoading(false);
      });
  };

  // Mark a session as completed
  const markSessionCompleted = (vehicleType) => {
    setIsMarkingProgress(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    axios.post('http://localhost:8081/api/session/mark-completed', {
      studentId: id,
      vehicleType: vehicleType
    })
    .then(res => {
      if (res.data.success) {
        setSummary(res.data.summary);
        setSuccessMessage(res.data.message || "Session marked as completed successfully!");
        
        // Find the updated vehicle progress
        const updatedVehicle = res.data.summary.find(
          item => item.vehicle_type === vehicleType
        );
        
        if (updatedVehicle && 
            updatedVehicle.completedSessions >= updatedVehicle.totalSessions) {
          setSuccessMessage(
            `All ${updatedVehicle.totalSessions} sessions completed for ${updatedVehicle.vehicle_type}!`
          );
        }

        // Auto-dismiss success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
      setIsMarkingProgress(false);
    })
    .catch(err => {
      console.error("Error marking progress:", err);
      setErrorMessage(err.response?.data?.error || "Failed to update progress. Please try again.");
      setIsMarkingProgress(false);
    });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading progress...</p>
    </div>
  );

  return (
    <div className="mark-progress-page">
      <div className="sidebar-container">
        <InstructorSidebar />
      </div>
      <div className="mark-progress-container">
        <div className="progress-content">
          <div className="progress-header">
            <h2 className="student-name">{student.firstName} {student.lastName}'s Progress</h2>
            <p className="subtitle">Track and update training sessions</p>
          </div>
          
          {/* Success and error messages remain the same */}
          
          <div className="summary-section">
            <div className="summary-header">
              <h3>Training Session Summary</h3>
            </div>
            
            {summary.length > 0 ? (
              <div className="table-responsive">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Vehicle Type</th>
                      <th>Completed</th>
                      <th>Remaining</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((item, index) => {
                      const isCompleted = item.completedSessions >= item.totalSessions;
                      const isProcessing = isMarkingProgress && !isCompleted;
                      const progress = Math.round((item.completedSessions / item.totalSessions) * 100);
                      
                      return (
                        <tr key={index} className={isCompleted ? 'completed-row' : ''}>
                          <td className="vehicle-type">
                            <div className="vehicle-tag">
                              {item.vehicle_type}
                            </div>
                          </td>
                          <td className="completed">
                            <span className="value">{item.completedSessions}</span>
                          </td>
                          <td className="remaining">
                            <span className="value">{item.remainingSessions}</span>
                          </td>
                          <td className="total">
                            <span className="value">{item.totalSessions}</span>
                          </td>
                          <td>
                            <div className="action-container">
                              <div className="progress-bar-container">
                                <div 
                                  className="progress-bar" 
                                  style={{width: `${progress}%`}}
                                  title={`${progress}% complete`}
                                ></div>
                              </div>
                              <button 
                                onClick={() => markSessionCompleted(item.vehicle_type)}
                                className={`action-button ${isCompleted ? 'completed' : ''}`}
                                disabled={isCompleted || isProcessing}
                              >
                                {isCompleted ? (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span>Completed</span>
                                  </>
                                ) : isProcessing ? (
                                  <>
                                    <div className="button-spinner"></div>
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span>Mark Complete</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No progress data available for this student.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkProgress;