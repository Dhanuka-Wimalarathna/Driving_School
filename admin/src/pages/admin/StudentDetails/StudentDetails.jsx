import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar/Sidebar";
import axios from "axios";
import { 
  User, 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Clock,
  Send,
  FileText,
  MessageSquare,
  CreditCard,
  AlertCircle
} from "lucide-react";
import styles from './StudentDetails.module.css';

const StudentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = location.state || {};
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleBack = () => {
    navigate("/admin/students");
  };

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      alert("Please enter a message to send.");
      return;
    }

    try {
      setIsSending(true);
      await axios.post("http://localhost:8081/api/notifications/send", {
        studentIds: [student.id],
        message: notificationMessage,
      });

      // Show success toast
      showToast('success', 'Notification sent successfully!');

      setNotificationMessage("");
      setShowNotificationForm(false);
    } catch (error) {
      console.error("Error sending notification:", error);
      showToast('error', 'Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fix the error handler
  if (!student) {
    return (
      <div className={styles['dashboard-layout']}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className={`${styles['students-main-content']} ${sidebarCollapsed ? styles['collapsed'] : ''}`}>
          <div className={styles['student-details-container']}>
            <div className={styles['error-container']}>
              <AlertCircle size={32} />
              <h2>Student Not Found</h2>
              <p>The requested student information could not be found.</p>
              <button className={styles['back-button']} onClick={handleBack}>
                <ArrowLeft size={16} />
                <span>Return to Students List</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchPaymentHistory = async () => {
    if (!student?.id) return;
    setIsLoadingPayments(true);
    setPaymentError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:8081/api/payments?studentId=${student.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setPaymentHistory(response.data);
    } catch (error) {
      console.error("Payment history error:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        setPaymentError("Please login again");
      } else if (error.response?.status === 403) {
        setPaymentError("You don't have permission to view this payment history");
      } else {
        setPaymentError("Failed to load payment history. Please try again.");
      }
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handlePaymentHistoryClick = () => {
    setShowPaymentHistory(true);
    fetchPaymentHistory();
  };

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Calculate totals
  const paidTotal = paymentHistory
    .filter(payment => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  // Create a separate component for toast notifications:
  const showToast = (type, message) => {
    const toast = document.createElement("div");
    toast.className = `${styles['toast-notification']} ${styles[type]}`;
    
    const iconHTML = type === 'success' 
      ? `<div class="${styles['toast-icon']}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div>`
      : `<div class="${styles['toast-icon']}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>`;
    
    toast.innerHTML = iconHTML + message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  // Update the return statement
  return (
    <div className={styles['dashboard-layout']}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`${styles['students-main-content']} ${sidebarCollapsed ? styles['collapsed'] : ''}`}>
        <div className={styles['student-details-container']}>
          <header className={styles['student-details-header']}>
            <div className={styles['header-title']}>
              <h1>
                <span className={styles['title-icon']}>
                  <User size={24} />
                </span>
                Student Profile
              </h1>
              <p className={styles['subtitle']}>ID: {student.id}</p>
            </div>
            <button className={styles['back-button']} onClick={handleBack}>
              <ArrowLeft size={16} />
              <span>Back to Students</span>
            </button>
          </header>

          <div className={styles['profile-grid']}>
            <div className={`${styles['profile-card']} ${styles['main-info']}`}>
              <div className={styles['profile-header']}>
                <div className={`${styles['student-avatar']} ${styles['large']}`}>
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <div className={styles['student-name-details']}>
                  <h2>{student.firstName} {student.lastName}</h2>
                  <span className={`${styles['package-badge']} ${styles[student.selectedPackage.toLowerCase() === "none" ? "none" : "active"]}`}>
                    {student.selectedPackage}
                  </span>
                </div>
              </div>
              
              <div className={styles['info-grid']}>
                <div className={styles['info-item']}>
                  <Mail size={18} className={styles['info-icon']} />
                  <div>
                    <span className={styles['info-label']}>Email</span>
                    <span className={styles['info-value']}>{student.email}</span>
                  </div>
                </div>
                <div className={styles['info-item']}>
                  <Phone size={18} className={styles['info-icon']} />
                  <div>
                    <span className={styles['info-label']}>Phone</span>
                    <span className={styles['info-value']}>{student.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className={styles['info-item']}>
                  <Calendar size={18} className={styles['info-icon']} />
                  <div>
                    <span className={styles['info-label']}>Date of Birth</span>
                    <span className={styles['info-value']}>{formatDate(student.dateOfBirth)}</span>
                  </div>
                </div>
                <div className={styles['info-item']}>
                  <MapPin size={18} className={styles['info-icon']} />
                  <div>
                    <span className={styles['info-label']}>Address</span>
                    <span className={styles['info-value']}>{student.address || "Not provided"}</span>
                  </div>
                </div>
                <div className={styles['info-item']}>
                  <Package size={18} className={styles['info-icon']} />
                  <div>
                    <span className={styles['info-label']}>Package</span>
                    <span className={styles['info-value']}>{student.selectedPackage}</span>
                  </div>
                </div>
                <div className={styles['info-item']}>
                  <Clock size={18} className={styles['info-icon']} />
                  <div>
                    <span className={styles['info-label']}>Joined</span>
                    <span className={styles['info-value']}>{formatDate(student.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles['profile-card']} ${styles['action-card']}`}>
              <h3>Quick Actions</h3>
              <div className={styles['action-buttons']}>
                <button 
                  className={`${styles['action-btn']} ${styles['academic']}`}
                  onClick={handlePaymentHistoryClick}
                >
                  <FileText size={18} />
                  <span>Payment History</span>
                </button>
                <button 
                  className={`${styles['action-btn']} ${styles['notify']}`}
                  onClick={() => setShowNotificationForm(true)}
                >
                  <Send size={18} />
                  <span>Send Notification</span>
                </button>
              </div>
            </div>
          </div>

          {showNotificationForm && (
            <div className={styles['notification-panel-single']}>
              <div className={styles['notification-header']}>
                <h3>Send Notification to {student.firstName}</h3>
                <button 
                  className={styles['close-btn']}
                  onClick={() => setShowNotificationForm(false)}
                >
                  &times;
                </button>
              </div>
              <textarea
                className={styles['notification-textarea']}
                placeholder="Write your notification message here..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
              <div className={styles['notification-actions']}>
                <button
                  className={styles['cancel-btn']}
                  onClick={() => setShowNotificationForm(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles['send-notification-btn']}
                  onClick={handleSendNotification}
                  disabled={isSending || !notificationMessage.trim()}
                >
                  {isSending ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
          )}

          {showPaymentHistory && (
            <div className={styles['modal-overlay']}>
              <div className={styles['payment-history-modal']}>
                <div className={styles['modal-header']}>
                  <h3>
                    <CreditCard size={20} />
                    <span>Payment History for {student.firstName}</span>
                  </h3>
                  <button 
                    className={styles['close-btn']}
                    onClick={() => setShowPaymentHistory(false)}
                  >
                    &times;
                  </button>
                </div>
                {isLoadingPayments ? (
                  <div className={styles['loading-payments']}>
                    <div className={styles['spinner']}></div>
                    <p>Loading payment history...</p>
                  </div>
                ) : paymentError ? (
                  <div className={styles['payment-error']}>
                    <AlertCircle size={24} />
                    <p>{paymentError}</p>
                    <button 
                      className={styles['retry-btn']}
                      onClick={fetchPaymentHistory}
                    >
                      Retry
                    </button>
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className={styles['no-payments']}>
                    <p>No payment history found for this student.</p>
                  </div>
                ) : (
                  <div className={styles['payments-table-container']}>
                    {/* Totals Section */}
                    <div className={styles['payment-totals']}>
                      <div>
                        <strong>Total Paid:</strong> {formatCurrency(paidTotal)}
                      </div>
                    </div>
                    <table className={styles['payments-table']}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Transaction ID</th>
                          <th>Package</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment) => (
                          <tr key={payment.payment_id}>
                            <td>{formatDate(payment.transaction_date)}</td>
                            <td>{payment.transaction_id}</td>
                            <td>{student.selectedPackage}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>
                              <span className={`${styles['status-badge']} ${styles[payment.status]}`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDetails;
