import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './MarkProgress.module.css';
import InstructorSidebar from '../../../components/Sidebar/InstructorSidebar';

const MarkProgress = () => {
  const { id } = useParams();
  const location = useLocation();
  const student = location.state?.student || {};
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMarkingProgress, setIsMarkingProgress] = useState(false);
  const [isAcceptingTrial, setIsAcceptingTrial] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('');

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

  // Accept student for trial examination
  const acceptTrialExam = (vehicleType) => {
    setIsAcceptingTrial(vehicleType);
    setErrorMessage('');
    setSuccessMessage('');
    
    axios.post('http://localhost:8081/api/trial-exams/accept-trial', {
      studentId: id,
      vehicleType: vehicleType
    })
    .then(res => {
      if (res.data.success) {
        setSuccessMessage(res.data.message || `${student.firstName} has been accepted for ${vehicleType} trial examination!`);
        
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
      setIsAcceptingTrial(false);
    })
    .catch(err => {
      console.error("Error accepting for trial exam:", err);
      setErrorMessage(err.response?.data?.error || "Failed to accept for trial. Please try again.");
      setIsAcceptingTrial(false);
    });
  };

  // Check if any vehicle type has all sessions completed
  const hasCompletedVehicleTypes = summary.some(item => item.completedSessions >= item.totalSessions);

  // Find all completed vehicle types
  const completedVehicleTypes = summary.filter(item => item.completedSessions >= item.totalSessions);

  if (loading) return (
    <div className={styles["loading-container"]}>
      <div className={styles["loading-spinner"]}></div>
      <p>Loading progress...</p>
    </div>
  );

  return (
    <div className={styles["mark-progress-page"]}>
      <div className={styles["sidebar-container"]}>
        <InstructorSidebar />
      </div>
      <div className={styles["mark-progress-container"]}>
        <div className={styles["progress-content"]}>
          <div className={styles["progress-header"]}>
            <h2 className={styles["student-name"]}>{student.firstName} {student.lastName}'s Progress</h2>
            <p className={styles.subtitle}>Track and update training sessions</p>
          </div>
          
          {/* Success and error messages */}
          {successMessage && (
            <div className={`${styles.alert} ${styles["alert-success"]}`}>
              <div className={styles["alert-icon"]}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className={styles["alert-content"]}>{successMessage}</div>
            </div>
          )}
          
          {errorMessage && (
            <div className={`${styles.alert} ${styles["alert-error"]}`}>
              <div className={styles["alert-icon"]}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className={styles["alert-content"]}>{errorMessage}</div>
            </div>
          )}
          
          <div className={styles["summary-section"]}>
            <div className={styles["summary-header"]}>
              <h3>Training Session Summary</h3>
            </div>
            
            {summary.length > 0 ? (
              <>
                <div className={styles["table-responsive"]}>
                  <table className={styles["summary-table"]}>
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
                          <tr key={index} className={isCompleted ? styles["completed-row"] : ''}>
                            <td className={styles["vehicle-type"]}>
                              <div className={styles["vehicle-tag"]}>
                                {item.vehicle_type}
                              </div>
                            </td>
                            <td className={styles.completed}>
                              <span className={styles.value}>{item.completedSessions}</span>
                            </td>
                            <td className={styles.remaining}>
                              <span className={styles.value}>{item.remainingSessions}</span>
                            </td>
                            <td className={styles.total}>
                              <span className={styles.value}>{item.totalSessions}</span>
                            </td>
                            <td>
                              <div className={styles["action-container"]}>
                                <div className={styles["progress-bar-container"]} 
                                  data-tooltip={`${progress}% complete (${item.completedSessions}/${item.totalSessions})`}
                                >
                                  <div 
                                    className={styles["progress-bar"]} 
                                    style={{width: `${progress}%`}}
                                  ></div>
                                </div>
                                <button 
                                  onClick={() => markSessionCompleted(item.vehicle_type)}
                                  className={`${styles["action-button"]} ${isCompleted ? styles.completed : ''}`}
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
                                      <div className={styles["button-spinner"]}></div>
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

                {/* Separate Trial Examination Table */}
                {completedVehicleTypes.length > 0 && (
                  <div className={styles["trial-section"]}>
                    <div className={styles["trial-header"]}>
                      <h3>Trial Examination Eligibility</h3>
                      <p>The student has completed all required sessions for the following vehicle types:</p>
                    </div>
                    <div className={styles["table-responsive"]}>
                      <table className={`${styles["summary-table"]} ${styles["trial-table"]}`}>
                        <thead>
                          <tr>
                            <th>Vehicle Type</th>
                            <th>Sessions Completed</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedVehicleTypes.map((item, index) => {
                            const isTrialProcessing = isAcceptingTrial === item.vehicle_type;
                            
                            return (
                              <tr key={index}>
                                <td className={styles["vehicle-type"]}>
                                  <div className={styles["vehicle-tag"]}>
                                    {item.vehicle_type}
                                  </div>
                                </td>
                                <td className={styles.completed}>
                                  <span className={styles.value}>{item.completedSessions}/{item.totalSessions}</span>
                                </td>
                                <td className={styles.status}>
                                  <div className={`${styles["status-badge"]} ${styles.completed}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span>Ready for Trial</span>
                                  </div>
                                </td>
                                <td>
                                  <button 
                                    onClick={() => acceptTrialExam(item.vehicle_type)}
                                    className={`${styles["action-button"]} ${styles["trial-button"]}`}
                                    disabled={isTrialProcessing}
                                  >
                                    {isTrialProcessing ? (
                                      <>
                                        <div className={styles["button-spinner"]}></div>
                                        <span>Processing...</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span>Accept for Trial Exam</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles["no-data"]}>
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