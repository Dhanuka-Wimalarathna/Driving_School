import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, AlertCircle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './Payments.module.css';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    // Verify token exists before making any requests
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/sign-in');
      return;
    }
    
    fetchPayments();
  }, [navigate]);

  const fetchPayments = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/sign-in');
        return;
      }

      // First get all payments
      const allPaymentsResponse = await axios.get("http://localhost:8081/api/payments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Then get pending payments
      const pendingPaymentsResponse = await axios.get("http://localhost:8081/api/payments/pending", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Combine and format all payments
      const formattedPayments = allPaymentsResponse.data.map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount), // Convert to number here
        receiptNumber: `PAY-${payment.payment_id.toString().padStart(6, '0')}`,
        transaction_date: new Date(payment.transaction_date).toLocaleDateString(),
        student_name: payment.student_name || `Student ID: ${payment.student_id}`
      }));

      // Add student names to pending payments if available
      const pendingWithNames = pendingPaymentsResponse.data.map(pending => {
        const matchingPayment = formattedPayments.find(p => p.payment_id === pending.payment_id);
        return {
          ...pending,
          amount: parseFloat(pending.amount), // Convert to number here
          receiptNumber: `PAY-${pending.payment_id.toString().padStart(6, '0')}`,
          transaction_date: new Date(pending.transaction_date).toLocaleDateString(),
          student_name: pending.student_name || `Student ID: ${pending.student_id}`
        };
      });

      // Create a merged, deduplicated array
      const allPayments = formattedPayments.filter(payment => {
        // Keep only payments that aren't in the pending list
        return !pendingWithNames.some(pending => pending.payment_id === payment.payment_id);
      });
      
      setPayments([...pendingWithNames, ...allPayments]);
    } catch (error) {
      console.error("Error fetching payments:", error);
      
      if (error.response?.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('authToken');
        navigate('/admin/sign-in');
      } else {
        setErrorMessage(error.response?.data?.message || "Failed to load payment data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const approvePayment = async (paymentId) => {
    setIsApproving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/sign-in');
        return;
      }

      await axios.put(
        `http://localhost:8081/api/payments/${paymentId}/approve`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      // Optimistic UI update
      setPayments(payments.map(payment => 
        payment.payment_id === paymentId ? { ...payment, status: 'paid' } : payment
      ));
      
      // Show success toast
      showToast('Payment approved successfully', 'success');
    } catch (error) {
      console.error("Approval error:", error);
      showToast('Failed to approve payment', 'error');
    } finally {
      setIsApproving(false);
    }
  };

  const unapprovePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to mark this payment as not approved?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/sign-in');
        return;
      }

      await axios.put(
        `http://localhost:8081/api/payments/${paymentId}/unapprove`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      // Optimistic UI update
      setPayments(payments.map(payment => 
        payment.payment_id === paymentId ? { ...payment, status: 'pending' } : payment
      ));
      
      // Show success toast
      showToast('Payment marked as not approved', 'success');
    } catch (error) {
      console.error("Unapproval error:", error);
      showToast('Failed to update payment status', 'error');
    }
  };

  const rejectPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/sign-in');
        return;
      }

      await axios.put(
        `http://localhost:8081/api/payments/${paymentId}/reject`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      // Optimistic UI update
      setPayments(payments.map(payment => 
        payment.payment_id === paymentId ? { ...payment, status: 'failed' } : payment
      ));
      
      // Show success toast
      showToast('Payment rejected', 'success');
    } catch (error) {
      console.error("Rejection error:", error);
      showToast('Failed to reject payment', 'error');
    }
  };

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'card': return 'Credit/Debit Card';
      case 'cash': return 'Cash';
      case 'bank': return 'Bank Transfer';
      default: return method || 'Unknown';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-badge pending';
      case 'paid': return 'status-badge paid';
      case 'failed': return 'status-badge failed';
      default: return 'status-badge';
    }
  };
  
  const showToast = (message, type = 'success') => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    
    // Use icon based on type
    const iconName = type === 'success' ? 'CheckCircle' : 'AlertCircle';
    toast.innerHTML = `<span class="toast-icon">${iconName}</span> ${message}`;
    
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (payment.student_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="students-main-content">
        <div className="students-container">
          <header className="students-header">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <CreditCard size={24} />
                </span>
                Payments
              </h1>
              <p className="subtitle">
                {filteredPayments.length} {filteredPayments.length === 1 ? "payment" : "payments"} found
              </p>
            </div>
            
            <div className="search-wrapper">
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by receipt number or student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </header>

          <div className="notification-panel">
            <div className="notification-stats">
              <div className={`stat-card ${filterStatus === 'all' ? 'total' : ''}`} 
                   onClick={() => setFilterStatus('all')}>
                <span className="count">{payments.length}</span>
                <span className="label">All</span>
              </div>
              <div className={`stat-card ${filterStatus === 'pending' ? 'total' : ''}`}
                   onClick={() => setFilterStatus('pending')}>
                <span className="count">{payments.filter(p => p.status === 'pending').length}</span>
                <span className="label">Pending</span>
              </div>
              <div className={`stat-card ${filterStatus === 'paid' ? 'total' : ''}`}
                   onClick={() => setFilterStatus('paid')}>
                <span className="count">{payments.filter(p => p.status === 'paid').length}</span>
                <span className="label">Paid</span>
              </div>
              <div className={`stat-card ${filterStatus === 'failed' ? 'total' : ''}`}
                   onClick={() => setFilterStatus('failed')}>
                <span className="count">{payments.filter(p => p.status === 'failed').length}</span>
                <span className="label">Failed</span>
              </div>
            </div>
            <div className="notification-compose refresh-container">
              <button 
                className="send-notification-btn refresh-button"
                onClick={fetchPayments} 
                disabled={isLoading}
              >
                <RefreshCw size={16} />
                <span>Refresh Payments</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading payment data...</p>
            </div>
          ) : errorMessage ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button className="retry-btn" onClick={fetchPayments}>Retry</button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="no-data">
              <AlertCircle size={32} />
              <p>No payments found matching your criteria</p>
              {(searchQuery || filterStatus !== 'all') && (
                <button className="clear-search" onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Student</th>
                    <th>Package</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(payment => (
                    <tr key={payment.payment_id} className={payment.status === 'pending' ? 'selected-row' : ''}>
                      <td className="student-id">{payment.receiptNumber}</td>
                      <td className="student-name">
                        <div className="name-cell">
                          <div className="avatar">
                            {payment.student_name.split(' ').map(name => name.charAt(0)).join('').substring(0, 2)}
                          </div>
                          <div className="name-text">{payment.student_name}</div>
                        </div>
                      </td>
                      <td>{payment.packageName || `Package ID: ${payment.package_id}`}</td>
                      <td className="amount-cell">LKR {payment.amount.toFixed(2)}</td>
                      <td>
                        <span className={`package-badge ${payment.payment_method}`}>
                          {getPaymentMethodDisplay(payment.payment_method)}
                        </span>
                      </td>
                      <td>{payment.transaction_date}</td>
                      <td>
                        <span className={`package-badge ${payment.status}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {payment.status === 'pending' ? (
                            <>
                              <button 
                                className="approve-btn" 
                                onClick={() => approvePayment(payment.payment_id)}
                                disabled={isApproving}
                                title="Approve payment"
                              >
                                <CheckCircle size={16} />
                                <span>Approve</span>
                              </button>
                              <button 
                                className="reject-btn" 
                                onClick={() => rejectPayment(payment.payment_id)}
                                title="Reject payment"
                              >
                                <XCircle size={16} />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <div className="action-placeholder">—</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Payments;