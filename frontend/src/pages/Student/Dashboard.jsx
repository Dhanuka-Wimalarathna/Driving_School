import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Sidebar from "../../components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastPaymentCheck, setLastPaymentCheck] = useState(Date.now());
  const [showAllLessons, setShowAllLessons] = useState(false);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const studentResponse = await axios.get("http://localhost:8081/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(studentResponse.data);
      
      // Store the student ID for later use
      const studentId = studentResponse.data.STU_ID;
      
      const notificationsResponse = await axios.get('http://localhost:8081/api/notifications/show', {
        headers: { 'Authorization': `Bearer ${token}`, 'studentId': studentResponse.data.id }
      });
      setNotifications(notificationsResponse.data || []);

      const bookingsResponse = await axios.get('http://localhost:8081/api/booking/student', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookingsResponse.data || []);

      const fetchPayments = async () => {
        console.log("Fetching payments data...");
        try {
          const paymentsResponse = await axios.get(
            `http://localhost:8081/api/studentDashboard?timestamp=${Date.now()}`, 
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000 // 10 second timeout
            }
          );
          
          console.log("Payments response:", paymentsResponse.data);
          
          if (paymentsResponse.data) {
            if (paymentsResponse.data.success === false) {
              console.error("Payment fetch returned error:", paymentsResponse.data.message);
              return [];
            }
            
            const payments = paymentsResponse.data.payments || [];
            return payments.sort((a, b) => {
              return new Date(b.transaction_date) - new Date(a.transaction_date);
            });
          }
          return [];
        } catch (error) {
          console.error("Error fetching payments:", error);
          return [];
        }
      };

      const paymentsData = await fetchPayments();
      console.log("Setting payments state with:", paymentsData);
      setPayments(paymentsData);
      setLastPaymentCheck(Date.now());

      try {
        // Make sure we have the student ID
        const studentId = studentResponse.data.STU_ID;
        console.log("Fetching exams for student ID:", studentId);
        
        try {
          // First try without the ID parameter (relying on auth middleware)
          const examResponse = await axios.get(`http://localhost:8081/api/trial-exams/student`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (examResponse.data && examResponse.data.success) {
            console.log("Successfully fetched exam data:", examResponse.data.data);
            setExamData(examResponse.data.data || []);
          } else {
            console.warn("API returned unsuccessful response:", examResponse.data);
            setExamData([]);
          }
        } catch (examError) {
          console.log("First exam fetch attempt failed, trying with explicit ID");
          
          // If that fails, try with the ID as a parameter
          const fallbackResponse = await axios.get(`http://localhost:8081/api/trial-exams/student?id=${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (fallbackResponse.data && fallbackResponse.data.success) {
            console.log("Fallback successfully fetched exam data:", fallbackResponse.data.data);
            setExamData(fallbackResponse.data.data || []);
          } else {
            console.warn("Fallback API returned unsuccessful response:", fallbackResponse.data);
            setExamData([]);
          }
        }
      } catch (error) {
        console.error("All attempts to fetch exam data failed:", error.response?.data || error.message);
        setExamData([]);
      }

    } catch (error) {
      console.error("Error in fetchAllData:", error);
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        console.log("Running automatic payment refresh");
        try {
          const token = localStorage.getItem("authToken");
          if (!token) return;
          
          const paymentsResponse = await axios.get(
            `http://localhost:8081/api/studentDashboard?timestamp=${Date.now()}`, 
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 8000
            }
          );
          
          if (paymentsResponse.data) {
            const newPayments = paymentsResponse.data.payments || [];
            const sortedPayments = newPayments.sort((a, b) => {
              return new Date(b.transaction_date) - new Date(a.transaction_date);
            });
            
            console.log("Auto-refresh got payments:", sortedPayments);
            setPayments(sortedPayments);
            setLastPaymentCheck(Date.now());
          }
        } catch (error) {
          console.error("Error in auto-refresh payments:", error);
        }
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          Date.now() - lastPaymentCheck > 60000) {
        fetchAllData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAllData, lastPaymentCheck]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getPaymentChartData = () => {
    const statusCounts = payments.reduce((acc, payment) => {
      const status = payment.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const chartData = {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#4CC9F0', '#F72585', '#7209B7', '#3A86FF'],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        hoverBackgroundColor: ['#3DB9E0', '#E71575', '#6208A7', '#2A76EF'],
        hoverBorderColor: 'white',
        hoverBorderWidth: 3,
        hoverOffset: 6
      }]
    };
    
    return chartData;
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`http://localhost:8081/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put("http://localhost:8081/api/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        <div className="dashboard-content">
          <div className="dashboard-wrapper">
            <div className="dashboard-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-house-door"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">
                    Welcome back, {student?.FIRST_NAME || "Student"}
                  </h1>
                  <p className="page-subtitle">Your driving progress overview</p>
                </div>
              </div>
              <div className="header-actions" ref={notificationsRef}>
                <button 
                  className="notification-bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <i className="bi bi-bell"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="notification-overlay" onClick={() => setShowNotifications(false)}></div>
                    <div className="notifications-dropdown">
                      <div className="dropdown-header">
                        <h4>Notifications</h4>
                        <button 
                          className="mark-all-read"
                          onClick={handleClearAllNotifications}
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="notifications-list">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <div className="notification-icon">
                                <i className={`bi ${getNotificationIcon(notification.type)}`}></i>
                              </div>
                              <div className="notification-content">
                                <h4 className="notification-title">{notification.title}</h4>
                                <p className="notification-message">{notification.message}</p>
                                <div className="notification-meta">
                                  <span className="notification-time">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-notifications">
                            <i className="bi bi-bell-slash"></i>
                            <p>No new notifications</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="dropdown-footer">
                          <button onClick={() => setShowNotifications(false)}>
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="dashboard-grid">
              {/* Payment Overview Card - Keep in half column */}
              <div className="dashboard-card payments-overview-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-graph-up"></i>
                    Payment Overview
                  </h2>
                  {/* Refresh button removed */}
                </div>
                <div className="card-body">
                  {payments.length > 0 ? (
                    <div className="vertical-payment-layout">
                      <div className="chart-container">
                        <Pie 
                          data={getPaymentChartData()} 
                          options={{ 
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                              legend: { 
                                position: 'bottom',
                                labels: {
                                  usePointStyle: true,
                                  padding: 10,
                                  font: {
                                    size: 11,
                                    weight: 'bold'
                                  }
                                }
                              },
                              tooltip: { 
                                enabled: true,
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                padding: 12,
                                cornerRadius: 8,
                                titleFont: {
                                  size: 14,
                                  weight: 'bold'
                                },
                                bodyFont: {
                                  size: 13
                                },
                                callbacks: {
                                  label: function(context) {
                                    return ` ${context.label}: ${context.raw} payment(s)`;
                                  }
                                }
                              }
                            },
                            elements: {
                              arc: {
                                borderWidth: 1,
                                borderColor: '#fff'
                              }
                            },
                            animation: {
                              animateRotate: true,
                              animateScale: true
                            }
                          }}
                        />
                      </div>
                      <div className="payment-stats">
                        <div className="total-payments">
                          <div className="stat-number">{payments.length}</div>
                          <div className="stat-label">Total Payments</div>
                        </div>
                      </div>
                      <div className="recent-payments-container">
                        <h5 className="recent-payments-title">Recent Payments</h5>
                        <div className="recent-payments-list">
                          {payments.slice(0, 3).map((payment, index) => (
                            <div key={payment.id || `payment-${index}`} className="recent-payment-item">
                              <div className="payment-amount">LKR. {payment.amount}</div>
                              <div className="payment-date">
                                {new Date(payment.transaction_date).toLocaleDateString()}
                              </div>
                              <div className={`payment-status-badge ${payment.status.toLowerCase()}`}>
                                {payment.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <i className="bi bi-credit-card-2-back"></i>
                      </div>
                      <h3 className="empty-title">No payment history</h3>
                      <p className="empty-subtitle">Your transactions will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - For Upcoming Lessons and Exams stacked vertically */}
              <div className="right-column-container">
                {/* Upcoming Lessons - First card in the right column */}
                <div className="dashboard-card lessons-card">
                  <div className="card-header">
                    <h2 className="card-title">
                      <i className="bi bi-calendar-check"></i>
                      Upcoming Lessons
                    </h2>
                  </div>
                  <div className="card-body">
                    {bookings.length > 0 ? (
                      <div className="lessons-list">
                        {bookings
                          .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date ascending
                          .slice(0, 3) // Show only the 3 most recent upcoming lessons (changed from 4)
                          .map((booking) => (
                            <div key={booking.id} className="lesson-item">
                              <div className="lesson-info">
                                <h5 className="lesson-title">{booking.vehicle_type} session</h5>
                                <p className="lesson-details">
                                  <i className="bi bi-calendar"></i> {new Date(booking.date).toLocaleDateString()} 
                                  <i className="bi bi-clock"></i> {booking.time}
                                </p>
                              </div>
                              <div className="lesson-status">
                                <span className={`status-badge ${booking.status ? booking.status.toLowerCase().replace(' ', '-') : "scheduled"}`}>
                                  {booking.status || "Scheduled"}
                                </span>
                              </div>
                            </div>
                          ))
                        }
                        {bookings.length > 3 && (
                          <div className="view-all-lessons">
                            <button className="secondary-link" onClick={() => setShowAllLessons(true)}>
                              View all lessons <i className="bi bi-arrow-right"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="bi bi-calendar-x"></i>
                        </div>
                        <h3 className="empty-title">No upcoming lessons</h3>
                        <p className="empty-subtitle">Your scheduled lessons will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Trial Exams Overview - Second card in the right column */}
                <div className="dashboard-card exams-overview-card">
                  <div className="card-header">
                    <h2 className="card-title">
                      <i className="bi bi-trophy"></i>
                      Trial Exams Overview
                    </h2>
                  </div>
                  <div className="card-body">
                    {examData.length > 0 ? (
                      <div className="exams-overview-container">
                        <div className="recent-exams-container">
                          <h5 className="recent-exams-title">Upcoming Exams</h5>
                          <div className="recent-exams-list">
                            {examData
                              .filter(exam => !exam.result || exam.result === 'Not Taken')
                              .sort((a, b) => new Date(a.exam_date || '9999-12-31') - new Date(b.exam_date || '9999-12-31'))
                              .slice(0, 3)
                              .map((exam, index) => (
                                <div key={exam.exam_id || `exam-${index}`} className="recent-exam-item">
                                  <div className="exam-type">
                                    <i className={getVehicleTypeIcon(exam.vehicle_type)}></i>
                                    <span>{exam.vehicle_type}</span>
                                  </div>
                                  <div className="exam-date-time">
                                    {exam.exam_date ? (
                                      <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                                    ) : (
                                      <span className="not-scheduled">Not scheduled</span>
                                    )}
                                    {exam.exam_time && (
                                      <span className="time-pill">{exam.exam_time}</span>
                                    )}
                                  </div>
                                  <div className={`exam-status-pill status-${exam.status ? exam.status.toLowerCase() : 'pending'}`}>
                                    {exam.status || "Pending"}
                                  </div>
                                </div>
                              ))}
                            {examData.filter(exam => !exam.result || exam.result === 'Not Taken').length === 0 && (
                              <div className="no-upcoming-exams">
                                No upcoming exams scheduled
                              </div>
                            )}
                          </div>
                          {examData.length > 3 && (
                            <div className="view-all-exams">
                              <button className="secondary-link" onClick={() => navigate('/student/exams')}>
                                View all exams <i className="bi bi-arrow-right"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="bi bi-journal-x"></i>
                        </div>
                        <h3 className="empty-title">No trial exams scheduled</h3>
                        <p className="empty-subtitle">No exams are currently scheduled</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
      
      {/* Modal for All Lessons */}
      {showAllLessons && (
        <>
          <div className="modal-overlay" onClick={() => setShowAllLessons(false)}></div>
          <div className="lessons-modal">
            <div className="modal-header">
              <h2><i className="bi bi-calendar-check"></i> All Upcoming Lessons</h2>
              <button className="close-button" onClick={() => setShowAllLessons(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {bookings.length > 0 ? (
                <div className="all-lessons-list">
                  {bookings
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((booking) => (
                      <div key={booking.id} className="lesson-item">
                        <div className="lesson-info">
                          <h5 className="lesson-title">{booking.vehicle_type} session</h5>
                          <p className="lesson-details">
                            <i className="bi bi-calendar"></i> {new Date(booking.date).toLocaleDateString()} 
                            <i className="bi bi-clock"></i> {booking.time}
                          </p>
                        </div>
                        <div className="lesson-status">
                          <span className={`status-badge ${booking.status ? booking.status.toLowerCase().replace(' ', '-') : "scheduled"}`}>
                            {booking.status || "Scheduled"}
                          </span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-calendar-x"></i>
                  </div>
                  <h3 className="empty-title">No upcoming lessons</h3>
                  <p className="empty-subtitle">You have no scheduled lessons at this time</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="action-button" onClick={() => setShowAllLessons(false)}>
                Close
              </button>
              <button className="action-button primary" onClick={() => navigate('/student/booking')}>
                Book New Lesson
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'lesson_booked':
      return 'bi-calendar-check';
    case 'lesson_canceled':
      return 'bi-calendar-x';
    case 'lesson_reminder':
      return 'bi-alarm';
    case 'payment_success':
      return 'bi-credit-card';
    case 'profile_update':
      return 'bi-person-check';
    default:
      return 'bi-bell';
  }
};

const getVehicleTypeIcon = (vehicleType) => {
  switch(vehicleType?.toLowerCase()) {
    case 'bike':
      return 'bi-bicycle';
    case 'three-wheeler':
      return 'bi-truck';
    case 'van':
      return 'bi-truck-front';
    default:
      return 'bi-car-front';
  }
};

const getStatusIcon = (status) => {
  switch(status.toLowerCase()) {
    case 'pending':
      return 'bi-hourglass-split';
    case 'approved':
      return 'bi-check-circle';
    case 'completed':
      return 'bi-flag';
    case 'rejected':
      return 'bi-x-circle';
    default:
      return 'bi-question-circle';
  }
};

export default Dashboard;