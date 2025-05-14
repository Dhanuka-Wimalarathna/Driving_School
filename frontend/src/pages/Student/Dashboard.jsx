import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Token:", token);
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch student details
        const studentResponse = await axios.get("http://localhost:8081/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(studentResponse.data);

        // Fetch notifications
        const notificationsResponse = await axios.get('http://localhost:8081/api/notifications/show', {
          headers: { 'Authorization': `Bearer ${token}`, 'studentId': studentResponse.data.id }
        });
        setNotifications(notificationsResponse.data || []);

        // Fetch bookings
        const bookingsResponse = await axios.get('http://localhost:8081/api/booking/student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookingsResponse.data || []);

        // Fetch payments
        const paymentsResponse = await axios.get('http://localhost:8081/api/studentDashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (paymentsResponse.data && paymentsResponse.data.success === false) {
          console.error('Backend reported error:', paymentsResponse.data.message);
          throw new Error(paymentsResponse.data.message);
        }
        setPayments(paymentsResponse.data.payments || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);
  // Payment status chart configuration
  const getPaymentChartData = () => {
    // Calculate total and remaining amounts
    let totalAmount = 0;
    let paidAmount = 0;
    
    // Group payments by status and calculate totals
    const statusCounts = payments.reduce((acc, payment) => {
      const status = payment.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      
      // Calculate total and paid amounts
      const amount = parseFloat(payment.amount);
      totalAmount += amount;
      if (status === 'paid' || status === 'completed') {
        paidAmount += amount;
      }
      
      return acc;
    }, {});
    
    // If we have package information, use that for total amount
    const packagePrice = payments.length > 0 && payments[0].package_price ? 
      parseFloat(payments[0].package_price) : 0;
    
    if (packagePrice > 0) {
      totalAmount = packagePrice;
    }
    
    // Calculate remaining amount
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    
    // Add remaining amount to chart data if it exists
    const chartData = {
      labels: [...Object.keys(statusCounts)],
      datasets: [{
        data: [...Object.values(statusCounts)],
        backgroundColor: ['#4CC9F0', '#F72585', '#7209B7', '#3A86FF'],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        hoverBackgroundColor: ['#3DB9E0', '#E71575', '#6208A7', '#2A76EF'],
        hoverBorderColor: 'white',
        hoverBorderWidth: 3,
        hoverOffset: 6
      }]
    };
    
    // If there's a remaining amount, add it to the chart
    if (remainingAmount > 0) {
      chartData.labels.push('Remaining');
      chartData.datasets[0].data.push(1); // Adding as 1 count
      chartData.datasets[0].backgroundColor.push('#6930C3');
      chartData.datasets[0].hoverBackgroundColor.push('#5B2BA3');
    }
    
    return chartData;
  };

  const handleBookLesson = () => {
    navigate("/student/booking");
  };

  const handleViewProfile = () => {
    navigate("/student/profile");
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
            </div>            <div className="dashboard-grid">
              {/* Payment Overview Card - Moved to the top */}
              <div className="dashboard-card payments-overview-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-graph-up"></i>
                    Payment Overview
                  </h2>
                </div>
                <div className="card-body">
                  {payments.length > 0 ? (
                    <div className="modern-chart-container">
                      <div className="chart-and-payments-wrapper">
                        <div className="reduced-chart">
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
                        <div className="recent-payments-container">
                          <h5 className="recent-payments-title">Recent Payments</h5>
                          <div className="recent-payments-list">
                            {payments.slice(0, 3).map(payment => (
                              <div key={payment.id} className="recent-payment-item">
                                <div className="payment-amount">${payment.amount}</div>
                                <div className="payment-date">
                                  {new Date(payment.transaction_date).toLocaleDateString()}
                                </div>
                                <div className={`payment-status-badge ${payment.status}`}>
                                  {payment.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="payment-stats">
                        <div className="total-payments">
                          <div className="stat-number">{payments.length}</div>
                          <div className="stat-label">Total Payments</div>
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
              
              {/* Notifications */}
              <div className="dashboard-card notifications-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-bell"></i>
                    Notifications
                  </h2>
                  {notifications.length > 0 && (
                    <button className="action-button" onClick={handleClearAllNotifications}>
                      <i className="bi bi-check-all"></i>
                      Mark All Read
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {notifications.length > 0 ? (
                    <div className="notifications-list">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-item ${!notification.is_read ? "unread" : ""}`}
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
                          {!notification.is_read && (
                            <button
                              className="notification-action"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-notifications">
                      <div className="empty-icon">
                        <i className="bi bi-bell-slash"></i>
                      </div>
                      <h3 className="empty-title">No new notifications</h3>
                      <p className="empty-subtitle">We'll notify you when there's something important</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile */}
              <div className="dashboard-card profile-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-person-circle"></i>
                    Student Profile
                  </h2>
                  <button className="action-button" onClick={handleViewProfile}>
                    <i className="bi bi-pencil-square"></i>
                    My Profile
                  </button>
                </div>
                <div className="card-body">
                  {student ? (
                    <div className="profile-grid">
                      <div className="profile-item">
                        <div className="item-label">Full Name</div>
                        <div className="item-value">{student.FIRST_NAME} {student.LAST_NAME}</div>
                      </div>
                      <div className="profile-item">
                        <div className="item-label">Email</div>
                        <div className="item-value">{student.EMAIL}</div>
                      </div>
                      <div className="profile-item">
                        <div className="item-label">NIC</div>
                        <div className="item-value">{student.NIC}</div>
                      </div>
                      <div className="profile-item">
                        <div className="item-label">Date of Birth</div>
                        <div className="item-value">
                          {student.BIRTHDAY ? new Date(student.BIRTHDAY).toLocaleDateString("en-CA") : "N/A"}
                        </div>
                      </div>
                      <div className="profile-item full-width">
                        <div className="item-label">Address</div>
                        <div className="item-value">{student.ADDRESS}</div>
                      </div>
                      <div className="profile-item">
                        <div className="item-label">Phone</div>
                        <div className="item-value">{student.PHONE}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>Unable to load student data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Lessons */}
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
                      {bookings.map((booking) => (
                        <div key={booking.id} className="lesson-item">
                          <div className="lesson-info">
                            <h5 className="lesson-title">{booking.vehicle_type} session</h5>
                            <p className="lesson-date">
                              {new Date(booking.date).toLocaleDateString()} — {booking.time}
                            </p>
                            {booking.instructor_name && (
                              <p className="lesson-instructor">Instructor: {booking.instructor_name}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-lessons">
                      <div className="empty-icon">
                        <i className="bi bi-calendar-x"></i>
                      </div>
                      <h3 className="empty-title">No upcoming lessons</h3>
                      <p className="empty-subtitle">Book your first driving lesson now</p>
                    </div>
                  )}                  {/* Always show this button */}
                  <div className="book-lesson-button">
                    <button className="confirm-button active" onClick={handleBookLesson}>
                      <i className="bi bi-plus-circle"></i>
                      Book New Lesson
                    </button>
                  </div>
                </div>
              </div>
              
              {/* End of dashboard grid */}
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

// Helper function to get icons based on notification type
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

export default Dashboard;
