import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
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
import "./StudentDetails.css";

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
      const toast = document.createElement("div");
      toast.className = "toast-notification success";
      toast.innerHTML = `<div class="toast-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div>Notification sent successfully!`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);

      setNotificationMessage("");
      setShowNotificationForm(false);
    } catch (error) {
      console.error("Error sending notification:", error);
      const toast = document.createElement("div");
      toast.className = "toast-notification error";
      toast.innerHTML = `<div class="toast-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>Failed to send notification.`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } finally {
      setIsSending(false);
    }
  };

  if (!student) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="students-main-content">
          <div className="student-details-container">
            <div className="error-container">
              <AlertCircle size={32} />
              <h2>Student Not Found</h2>
              <p>The requested student information could not be found.</p>
              <button className="back-button" onClick={handleBack}>
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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="students-main-content">
        <div className="student-details-container">
          <header className="student-details-header">
            <button className="back-button" onClick={handleBack}>
              <ArrowLeft size={16} />
              <span>Back to Students</span>
            </button>
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <User size={24} />
                </span>
                Student Profile
              </h1>
              <p className="subtitle">ID: {student.id}</p>
            </div>
          </header>

          <div className="profile-grid">
            <div className="profile-card main-info">
              <div className="profile-header">
                <div className="student-avatar large">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <div className="student-name-details">
                  <h2>{student.firstName} {student.lastName}</h2>
                  <span className={`package-badge ${student.selectedPackage.toLowerCase() === "none" ? "none" : "active"}`}>
                    {student.selectedPackage}
                  </span>
                </div>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <Mail size={18} />
                  <div>
                    <span className="info-label">Email</span>
                    <span className="info-value">{student.email}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Phone size={18} />
                  <div>
                    <span className="info-label">Phone</span>
                    <span className="info-value">{student.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar size={18} />
                  <div>
                    <span className="info-label">Date of Birth</span>
                    <span className="info-value">{formatDate(student.dateOfBirth)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <MapPin size={18} />
                  <div>
                    <span className="info-label">Address</span>
                    <span className="info-value">{student.address || "Not provided"}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Package size={18} />
                  <div>
                    <span className="info-label">Package</span>
                    <span className="info-value">{student.selectedPackage}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Clock size={18} />
                  <div>
                    <span className="info-label">Joined</span>
                    <span className="info-value">{formatDate(student.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-card action-card">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn academic"
                  onClick={handlePaymentHistoryClick}
                >
                  <FileText size={18} />
                  <span>Payment History</span>
                </button>
                <button className="action-btn message">
                  <MessageSquare size={18} />
                  <span>Contact Student</span>
                </button>
                <button 
                  className="action-btn notify"
                  onClick={() => setShowNotificationForm(true)}
                >
                  <Send size={18} />
                  <span>Send Notification</span>
                </button>
              </div>
            </div>
          </div>

          {showNotificationForm && (
            <div className="notification-panel-single">
              <div className="notification-header">
                <h3>Send Notification to {student.firstName}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowNotificationForm(false)}
                >
                  &times;
                </button>
              </div>
              <textarea
                className="notification-textarea"
                placeholder="Write your notification message here..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
              <div className="notification-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowNotificationForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="send-notification-btn"
                  onClick={handleSendNotification}
                  disabled={isSending || !notificationMessage.trim()}
                >
                  {isSending ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
          )}

          {showPaymentHistory && (
            <div className="modal-overlay">
              <div className="payment-history-modal">
                <div className="modal-header">
                  <h3>
                    <CreditCard size={20} />
                    <span>Payment History for {student.firstName}</span>
                  </h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowPaymentHistory(false)}
                  >
                    &times;
                  </button>
                </div>
                {isLoadingPayments ? (
                  <div className="loading-payments">
                    <div className="spinner"></div>
                    <p>Loading payment history...</p>
                  </div>
                ) : paymentError ? (
                  <div className="payment-error">
                    <AlertCircle size={24} />
                    <p>{paymentError}</p>
                    <button 
                      className="retry-btn"
                      onClick={fetchPaymentHistory}
                    >
                      Retry
                    </button>
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="no-payments">
                    <p>No payment history found for this student.</p>
                  </div>
                ) : (
                  <div className="payments-table-container">
                    {/* Totals Section */}
                    <div className="payment-totals">
                      <div>
                        <strong>Total Paid:</strong> {formatCurrency(paidTotal)}
                      </div>
                    </div>
                    <table className="payments-table">
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
                              <span className={`status-badge ${payment.status}`}>
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
