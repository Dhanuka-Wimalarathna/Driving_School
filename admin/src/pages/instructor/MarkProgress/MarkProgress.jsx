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
  const [errorMessage, setErrorMessage] = useState('');
  const [isMarkingProgress, setIsMarkingProgress] = useState(false);
  const [isAcceptingTrial, setIsAcceptingTrial] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  
  // Add new states for modal
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialFormData, setTrialFormData] = useState({
    examDate: '',
    examTime: '',
    vehicleType: ''
  });

  const [existingTrials, setExistingTrials] = useState({});

  // Fetch progress summary data with cache busting
  useEffect(() => {
    fetchProgress();
  }, [id]);

  // Fetch existing trial exams for this student
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8081/api/trial-exams?studentId=${id}`)
        .then(res => {
          if (res.data.success) {
            // Transform the array into an object with vehicle_type as key
            const trialsByVehicleType = {};
            res.data.data.forEach(trial => {
              trialsByVehicleType[trial.vehicle_type] = trial;
            });
            setExistingTrials(trialsByVehicleType);
          }
        })
        .catch(err => {
          console.error("Error fetching existing trials:", err);
          // Don't show an error message to the user, just silently handle it
          setExistingTrials({});
        });
    }
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
        showToast(err.response?.data?.error || "Failed to load progress data. Please try again.", 'error');
        setLoading(false);
      });
  };

  // Toast notification function
  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `${styles["toast-notification"]} ${styles[type]}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  // Mark a session as completed
  const markSessionCompleted = (vehicleType) => {
    setIsMarkingProgress(true);
    
    axios.post('http://localhost:8081/api/session/mark-completed', {
      studentId: id,
      vehicleType: vehicleType
    })
    .then(res => {
      if (res.data.success) {
        setSummary(res.data.summary);
        
        // Find the updated vehicle progress
        const updatedVehicle = res.data.summary.find(
          item => item.vehicle_type === vehicleType
        );
        
        if (updatedVehicle && 
            updatedVehicle.completedSessions >= updatedVehicle.totalSessions) {
          showToast(`All ${updatedVehicle.totalSessions} sessions completed for ${updatedVehicle.vehicle_type}!`, 'success');
        } else {
          showToast(res.data.message || "Session marked as completed successfully!", 'success');
        }
      }
      setIsMarkingProgress(false);
    })
    .catch(err => {
      console.error("Error marking progress:", err);
      showToast(err.response?.data?.error || "Failed to update progress. Please try again.", 'error');
      setIsMarkingProgress(false);
    });
  };

  // Open trial modal when "Accept for Trial Exam" is clicked
  const openTrialModal = (vehicleType = '') => {
    // Set a default date (7 days from today)
    const defaultDate = getMinimumDate(7);
    
    setTrialFormData({
      examDate: defaultDate,
      examTime: '08:00', // Default time
      vehicleType: vehicleType
    });
    
    setShowTrialModal(true);
  };

  // Handle trial form input changes
  const handleTrialFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "examDate") {
      const minDate = getMinimumDate(7);
      if (value < minDate) {
        showToast("Exam date must be at least 7 days from today.", 'error');
        return;
      }
    }
    
    setTrialFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit trial exam request
  const submitTrialExam = (e) => {
    e.preventDefault();
    
    // Add extra validation to ensure we have completed vehicle types
    if (completedVehicleTypes.length === 0) {
      showToast("No completed vehicle types found to schedule trials for.", 'error');
      return;
    }
    
    // Validate date again for safety
    const minDate = getMinimumDate(7);
    if (trialFormData.examDate < minDate) {
      showToast("Exam date must be at least 7 days from today.", 'error');
      return;
    }
    
    // Return if already processing
    if (isAcceptingTrial) return;
    
    setIsAcceptingTrial(true);
    
    // For debugging
    console.log("Submitting trial exam with data:", trialFormData);
    console.log("Completed vehicle types:", completedVehicleTypes);
    
    // Create promises for each completed vehicle type
    const trialPromises = completedVehicleTypes.map(item => {
      return axios.post('http://localhost:8081/api/trial-exams/accept-trial', {
        studentId: id,
        vehicleType: item.vehicle_type,
        examDate: trialFormData.examDate,
        examTime: trialFormData.examTime
      }).catch(err => {
        // Return the error along with the vehicle type
        return { error: err, vehicleType: item.vehicle_type };
      });
    });
    
    // Execute all promises
    Promise.all(trialPromises)
      .then(responses => {
        // Check if any requests resulted in errors
        const errors = responses.filter(res => res.error);
        
        if (errors.length > 0) {
          // Some vehicle types failed to schedule
          const errorTypes = errors.map(e => e.vehicleType).join(', ');
          throw new Error(`Failed to schedule trials for: ${errorTypes}`);
        }
        
        console.log("All trial exams scheduled successfully:", responses);
        
        // Update existing trials for all vehicle types
        const newTrials = {};
        completedVehicleTypes.forEach(item => {
          newTrials[item.vehicle_type] = {
            vehicle_type: item.vehicle_type,
            exam_date: trialFormData.examDate,
            exam_time: trialFormData.examTime,
            status: 'Pending'
          };
        });
        
        // Update existing trials state
        setExistingTrials(prev => ({
          ...prev,
          ...newTrials
        }));
        
        // Create success message with vehicle types
        const vehicleTypes = completedVehicleTypes.map(item => item.vehicle_type).join(', ');
        showToast(`${student.firstName} has been accepted for trial examination for the following vehicle categories: ${vehicleTypes}`, 'success');
        
        // Close modal
        setShowTrialModal(false);
      })
      .catch(err => {
        console.error("Error accepting for trial exam:", err);
        showToast(err.message || "Failed to accept for trial. Please try again.", 'error');
      })
      .finally(() => {
        setIsAcceptingTrial(false);
      });
  };

  // Check if any vehicle type has all sessions completed
  const hasCompletedVehicleTypes = summary.some(item => item.completedSessions >= item.totalSessions);

  // Find all completed vehicle types
  const completedVehicleTypes = summary.filter(item => item.completedSessions >= item.totalSessions);

  // Function to get minimum date (today + specified days)
  const getMinimumDate = (daysAhead = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + daysAhead);
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Add this where you're calculating other derived values
  const hasAnyExistingTrial = Object.keys(existingTrials).length > 0;

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

                {/* Add a section for trial exam button that only appears when all sessions are completed */}
                {hasCompletedVehicleTypes && completedVehicleTypes.length === summary.length && !hasAnyExistingTrial && (
                  <div className={styles["trial-eligibility-section"]}>
                    <div className={styles["eligibility-message"]}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <p>Congratulations! {student.firstName} has completed all required sessions for all vehicle types and is eligible for trial examination.</p>
                    </div>
                    <div className={styles["trial-action"]}>
                      <button 
                        onClick={() => {
                          // Just open the modal, no need to set specific vehicle type
                          openTrialModal(); 
                        }}
                        className={`${styles["trial-cta-button"]}`}
                        disabled={isAcceptingTrial}
                      >
                        {isAcceptingTrial ? (
                          <>
                            <div className={styles["button-spinner"]}></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <path d="M20 8v6"></path>
                              <path d="M23 11h-6"></path>
                            </svg>
                            <span>Schedule Trial Examination</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Separate Trial Examination Table - Only show if there are existing trials */}
                {hasAnyExistingTrial && (
                  <div className={styles["trial-section"]}>
                    <div className={styles["trial-header"]}>
                      <h3>Trial Examination Status</h3>
                      <p>The student's current trial examination status:</p>
                    </div>
                    <div className={styles["table-responsive"]}>
                      <table className={`${styles["summary-table"]} ${styles["trial-table"]}`}>
                        <thead>
                          <tr>
                            <th>Vehicle Type</th>
                            <th>Sessions Completed</th>
                            <th>Status</th>
                            <th>Scheduled Date/Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(existingTrials).map((trial, index) => {
                            // Find the corresponding summary item
                            const summaryItem = summary.find(item => item.vehicle_type === trial.vehicle_type);
                            
                            return (
                              <tr key={index}>
                                <td className={styles["vehicle-type"]}>
                                  <div className={styles["vehicle-tag"]}>
                                    {trial.vehicle_type}
                                  </div>
                                </td>
                                <td className={styles.completed}>
                                  <span className={styles.value}>
                                    {summaryItem ? `${summaryItem.completedSessions}/${summaryItem.totalSessions}` : "N/A"}
                                  </span>
                                </td>
                                <td className={styles.status}>
                                  <div className={`${styles["status-badge"]} ${styles[trial.status.toLowerCase()]}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span>
                                      {trial.status === 'Pending' && 'Trial Scheduled'}
                                      {trial.status === 'Approved' && 'Trial Approved'}
                                      {trial.status === 'Completed' && 'Trial Completed'}
                                      {trial.status === 'Rejected' && 'Trial Rejected'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className={styles["trial-info"]}>
                                    <div className={styles["trial-date"]}>
                                      {new Date(trial.exam_date).toLocaleDateString()}
                                    </div>
                                    <div className={styles["trial-time"]}>
                                      {trial.exam_time}
                                    </div>
                                  </div>
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

      {/* Trial Modal */}
      {showTrialModal && (
        <div className={styles["modal-overlay"]} onClick={() => setShowTrialModal(false)}>
          <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["modal-header"]}>
              <h3>Schedule Trial Examination for All Vehicle Categories</h3>
              <button className={styles["close-modal-btn"]} onClick={() => setShowTrialModal(false)}>
                &times;
              </button>
            </div>
            <div className={styles["modal-body"]}>
              <form onSubmit={submitTrialExam}>
                <div className={styles["categories-list"]}>
                  <label>Vehicle Categories to Schedule:</label>
                  <div className={styles["vehicle-categories"]}>
                    {completedVehicleTypes.map((item, index) => (
                      <div key={index} className={styles["vehicle-category-badge"]}>
                        {item.vehicle_type}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="examDate">Exam Date</label>
                  <input
                    type="date"
                    id="examDate"
                    name="examDate"
                    value={trialFormData.examDate}
                    onChange={handleTrialFormChange}
                    className={styles["form-control"]}
                    required
                  />
                </div>
                <div className={styles["form-group"]}>
                  <label htmlFor="examTime">Exam Time</label>
                  <input
                    type="time"
                    id="examTime"
                    name="examTime"
                    value={trialFormData.examTime}
                    onChange={handleTrialFormChange}
                    className={styles["form-control"]}
                    required
                  />
                </div>
                <div className={styles["modal-actions"]}>
                  <button 
                    type="button" 
                    className={styles["cancel-button"]}
                    onClick={() => setShowTrialModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles["confirm-button"]}
                    disabled={isAcceptingTrial}
                  >
                    {isAcceptingTrial ? (
                      <>
                        <div className={styles["button-spinner"]}></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Schedule Trial</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkProgress;