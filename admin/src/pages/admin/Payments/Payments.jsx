import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, AlertCircle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import styles from './Payments.module.css';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isApproving, setIsApproving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    // Verify token exists before making any requests
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/sign-in');
      return;
    }
    
    fetchPayments();
  }, [navigate]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ ...toast, visible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
        transaction_date: new Date(payment.transaction_date).toLocaleDateString(),
        student_name: payment.student_name || `Student ID: ${payment.student_id}`
      }));

      // Add student names to pending payments if available
      const pendingWithNames = pendingPaymentsResponse.data.map(pending => {
        const matchingPayment = formattedPayments.find(p => p.payment_id === pending.payment_id);
        return {
          ...pending,
          amount: parseFloat(pending.amount), // Convert to number here
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
        showToast('Failed to load payments', 'error');
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
      showToast(`Payment #${paymentId} approved successfully`, 'success');
    } catch (error) {
      console.error("Approval error:", error);
      showToast(`Failed to approve payment #${paymentId}`, 'error');
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
      showToast(`Payment #${paymentId} marked as pending`, 'success');
    } catch (error) {
      console.error("Unapproval error:", error);
      showToast(`Failed to update payment #${paymentId} status`, 'error');
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
      showToast(`Payment #${paymentId} rejected successfully`, 'success');
    } catch (error) {
      console.error("Rejection error:", error);
      showToast(`Failed to reject payment #${paymentId}`, 'error');
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
      case 'pending': return `${styles['status-badge']} ${styles['pending']}`;
      case 'paid': return `${styles['status-badge']} ${styles['paid']}`;
      case 'failed': return `${styles['status-badge']} ${styles['failed']}`;
      default: return styles['status-badge'];
    }
  };
  
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message: message,
      type: type
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.payment_id?.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (payment.student_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="page-container">
          <div className={styles['payments-content']}>
            {toast.visible && (
              <div className={`${styles['toast-notification']} ${styles[toast.type]}`}>
                <span className={styles['toast-icon']}>
                  {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                </span>
                <span className={styles['toast-message']}>{toast.message}</span>
              </div>
            )}

            <header className={styles['page-header']}>
              <div className={styles['header-title']}>
                <h1>
                  <span className={styles['title-icon']}>
                    <CreditCard size={24} />
                  </span>
                  Payments
                </h1>
                <p className={styles['subtitle']}>
                  {filteredPayments.length} {filteredPayments.length === 1 ? "payment" : "payments"} found
                </p>
              </div>
              
              <div className={styles['header-actions']}>
                <div className={styles['search-container']}>
                  <Search className={styles['search-icon']} size={18} />
                  <input
                    type="text"
                    className={styles['search-input']}
                    placeholder="Search by payment ID or student name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </header>

            <div className={styles['filter-controls']}>
              <div className={styles['status-stats']}>
                <div 
                  className={`${styles['stat-card']} ${filterStatus === 'all' ? styles['active'] : ''}`} 
                  onClick={() => setFilterStatus('all')}
                >
                  <span className={styles['count']}>{payments.length}</span>
                  <span className={styles['label']}>All</span>
                </div>
                <div className={`${styles['stat-card']} ${filterStatus === 'pending' ? styles['active'] : ''}`}
                     onClick={() => setFilterStatus('pending')}>
                  <span className={styles['count']}>{payments.filter(p => p.status === 'pending').length}</span>
                  <span className={styles['label']}>Pending</span>
                </div>
                <div className={`${styles['stat-card']} ${filterStatus === 'paid' ? styles['active'] : ''}`}
                     onClick={() => setFilterStatus('paid')}>
                  <span className={styles['count']}>{payments.filter(p => p.status === 'paid').length}</span>
                  <span className={styles['label']}>Paid</span>
                </div>
                <div className={`${styles['stat-card']} ${filterStatus === 'failed' ? styles['active'] : ''}`}
                     onClick={() => setFilterStatus('failed')}>
                  <span className={styles['count']}>{payments.filter(p => p.status === 'failed').length}</span>
                  <span className={styles['label']}>Failed</span>
                </div>
              </div>
              <button 
                className={styles['refresh-button']}
                onClick={fetchPayments} 
                disabled={isLoading}
              >
                <RefreshCw size={16} />
                <span>Refresh Payments</span>
              </button>
            </div>

            {isLoading ? (
              <div className={styles['loading-container']}>
                <div className={styles['loading-spinner']}></div>
                <p>Loading payment data...</p>
              </div>
            ) : errorMessage ? (
              <div className={styles['error-container']}>
                <AlertCircle size={24} />
                <p>{errorMessage}</p>
                <button className={styles['retry-btn']} onClick={fetchPayments}>Retry</button>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className={styles['no-data']}>
                <AlertCircle size={32} />
                <p>No payments found matching your criteria</p>
                {(searchQuery || filterStatus !== 'all') && (
                  <button className={styles['clear-search']} onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className={styles['payments-table-container']}>
                <table className={styles['payments-table']}>
                  <thead>
                    <tr>
                      <th>Payment ID</th>
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
                      <tr key={payment.payment_id} className={payment.status === 'pending' ? styles['pending-row'] : ''}>
                        <td className={styles['receipt-number']}>{payment.payment_id}</td>
                        <td className={styles['student-name']}>
                          <div className={styles['name-cell']}>
                            <div className={styles['avatar']}>
                              {payment.student_name.split(' ').map(name => name.charAt(0)).join('').substring(0, 2)}
                            </div>
                            <div className={styles['name-text']} title={payment.student_name}>
                              {payment.student_name.length > 20 
                                ? payment.student_name.substring(0, 18) + "..." 
                                : payment.student_name}
                            </div>
                          </div>
                        </td>
                        <td title={payment.packageName || `Package ID: ${payment.package_id}`}>
                          {payment.packageName 
                            ? (payment.packageName.length > 15 
                              ? payment.packageName.substring(0, 13) + "..." 
                              : payment.packageName)
                            : `Pkg ID: ${payment.package_id}`}
                        </td>
                        <td className={styles['amount-cell']}>
                          LKR {payment.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td>
                          <span className={`${styles['method-badge']} ${styles[payment.payment_method]}`}>
                            {getPaymentMethodDisplay(payment.payment_method)}
                          </span>
                        </td>
                        <td>{payment.transaction_date}</td>
                        <td>
                          <span className={`${styles['status-badge']} ${styles[payment.status]}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className={styles['table-actions']}>
                            {payment.status === 'pending' ? (
                              <>
                                <button 
                                  className={styles['approve-btn']} 
                                  onClick={() => approvePayment(payment.payment_id)}
                                  disabled={isApproving}
                                  title="Approve payment"
                                >
                                  <CheckCircle size={16} />
                                  <span>Approve</span>
                                </button>
                                <button 
                                  className={styles['reject-btn']} 
                                  onClick={() => rejectPayment(payment.payment_id)}
                                  title="Reject payment"
                                >
                                  <XCircle size={16} />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <div className={styles['action-placeholder']}>—</div>
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
        </div>
      </main>
    </div>
  );
};

export default Payments;