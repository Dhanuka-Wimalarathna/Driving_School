import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import InvoiceGenerator from '../../components/InvoiceGenerator';
import { formatCurrency, formatDate } from '../../utils/formatters';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Payments.css';
import '../../components/Sidebar.css';
import { useNavigate } from 'react-router-dom';

const Payments = () => {
  const { user, login } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [alreadyPaid, setAlreadyPaid] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [paymentError, setPaymentError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // Default payment method
  const navigate = useNavigate();
  
  // Check for user data in localStorage if it's not in the AuthContext
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          login(parsedUser);
          console.log('User data loaded from localStorage');
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      } else {
        console.warn('No user data found in localStorage');
        navigate('/login');
      }
    }
  }, [user, login, navigate]);

  const fetchData = () => {
    setIsLoading(true);
    
    // Fetch both endpoints in parallel
    Promise.all([
      fetch('http://localhost:8081/api/select-package/get-selected-package', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      }).then(res => res.json()),
      fetch('http://localhost:8081/api/payments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      }).then(res => res.json())
    ])
    .then(([packageData, payments]) => {
      if (!packageData.message) {
        setSelectedPackage(packageData);
        
        // Process all payments (not just 'paid' ones)
        const allPayments = payments.map(p => ({
          ...p,
          amount: parseFloat(p.amount)
        }));
        
        // Show all payments (ordered by date, newest first)
        allPayments.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
        setPaymentHistory(allPayments);
        
        // Calculate total paid amount (only count 'paid' status for financial calculations)
        const paidPayments = allPayments.filter(p => p.status.toLowerCase() === 'paid');
        const paidTotal = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        setAlreadyPaid(paidTotal);
        
        // Calculate remaining amount
        const packagePrice = parseFloat(packageData.price);
        const remaining = packagePrice - paidTotal;
        setRemainingAmount(Math.max(0, remaining));
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error('Error fetching data:', err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    try {
      // Check if dateString is valid
      if (!dateString) return 'N/A';
      
      // Handle both ISO string format and MySQL datetime format
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'bank') {
      showToast('Please include your name and student ID in the bank transfer reference', 'info');
    }
  };

  const handlePaymentClick = () => {
    if (selectedPackage && remainingAmount > 0) {
      setShowPaymentModal(true);
      setPaymentMethod('card'); // Reset to default payment method when opening modal
    }
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    setPaymentAmount(value);
    setPaymentError('');
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    
    // Create icon element
    const icon = document.createElement("i");
    icon.className = `bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`;
    icon.style.marginRight = "8px";
    
    // Create message text node
    const messageText = document.createTextNode(message);
    
    // Append icon and message to toast
    toast.appendChild(icon);
    toast.appendChild(messageText);
    
    document.body.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const validatePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount)) {
      showToast('Please enter a valid number', 'error');
      return false;
    }
    if (amount <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return false;
    }
    if (amount > remainingAmount) {
      showToast(`Amount cannot exceed remaining balance (${formatCurrency(remainingAmount)})`, 'error');
      return false;
    }
    return true;
  };

  const generateTransactionId = () => {
    return `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  const handleConfirmPayment = async () => {
    if (!validatePayment()) return;

    try {
      const amount = parseFloat(paymentAmount);
      
      const newPayment = {
        id: Date.now(),
        amount,
        date: new Date().toISOString(),
        status: 'pending',
        method: paymentMethod
      };

      setPaymentHistory([...paymentHistory, newPayment]);

      const response = await fetch(
        'http://localhost:8081/api/payments/make-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            amount,
            packageId: selectedPackage.package_id,
            transactionId: generateTransactionId(),
            paymentMethod: paymentMethod
          })
        }
      );

      if (!response.ok) throw new Error('Payment failed');

      setPaymentAmount('');
      setShowPaymentModal(false);
      fetchData();
      
      showToast(`Payment of ${formatCurrency(amount)} via ${paymentMethod} Pending`, 'success');
    } catch (err) {
      console.error('Payment error:', err);
      showToast('Payment failed. Please try again.', 'error');
      fetchData();
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentAmount('');
    setPaymentError('');
  };

  const calculatePaymentPercentage = () => {
    if (!selectedPackage || parseFloat(selectedPackage.price) <= 0) return 0;
    
    // Only include payments with 'paid' status
    const paidTotal = paymentHistory
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      
    return Math.min(100, (paidTotal / parseFloat(selectedPackage.price)) * 100);
  };

  // Add a helper function to get payment method display name
  const getPaymentMethodDisplay = (method) => {
    switch(method) {
      case 'card': return 'Card Payment';
      case 'cash': return 'Cash Payment';
      case 'bank': return 'Bank Transfer';
      default: return method;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        <div className="dashboard-content">
          <div className="dashboard-wrapper">
            {/* Header */}
            <div className="dashboard-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-credit-card"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">Payment History</h1>
                  <p className="page-subtitle">View and manage all your transaction records</p>
                </div>
              </div>
            </div>

            {/* Selected Package */}
            {isLoading ? (
              <div className="selected-package">
                <div className="loading-spinner"></div>
                <p>Loading your package information...</p>
              </div>
            ) : selectedPackage ? (
              <div className="selected-package">
                <div className="package-badge">
                  {remainingAmount <= 0 ? 'Fully Paid' : 'Active'}
                </div>
                <h2>Your Selected Package</h2>
                <p className="package-name">{selectedPackage.packageName}</p>
                <p className="package-price">{formatCurrency(selectedPackage.price)}</p>
                <div className="payment-progress">
                  <div className="progress-details">
                    <span>Paid: {formatCurrency(alreadyPaid)}</span>
                    <span>Remaining: {formatCurrency(remainingAmount)}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${calculatePaymentPercentage()}%`,
                        backgroundColor: remainingAmount <= 0 ? '#10b759' : '#3a86ff'
                      }}
                    ></div>
                  </div>
                </div>
                {remainingAmount > 0 && (
                  <button 
                    className="make-payment-btn" 
                    onClick={handlePaymentClick}
                  >
                    Make Payment
                  </button>
                )}
              </div>
            ) : (
              <div className="selected-package">
                <h2>No Package Selected</h2>
                <p>You have not selected any package yet. Select a package to begin your learning journey.</p>
                <button className="make-payment-btn" onClick={() => navigate('/Student/Package')}>
                  Browse Packages
                </button>
              </div>
            )} 

            {/* Payment History */}
            <div className="payments-container">
              <div className="payments-header">
                <h2>Transaction Records</h2>
                <span className="payments-count">{paymentHistory.length} transactions</span>
              </div>

              <div className="table-container">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.length > 0 ? (
                      paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            {payment.transaction_date 
                              ? formatDate(payment.transaction_date) 
                              : formatDate(payment.date)}
                          </td>
                          <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                          <td className="method-cell">
                            {payment.payment_method ? (
                              <span className="method-badge">
                                <i className={`bi ${
                                  payment.payment_method === 'card' ? 'bi-credit-card' : 
                                  payment.payment_method === 'cash' ? 'bi-cash' : 
                                  payment.payment_method === 'bank' ? 'bi-bank' : 'bi-dash'
                                }`}></i>
                                {getPaymentMethodDisplay(payment.payment_method)}
                              </span>
                            ) : (
                              <span className="method-badge">
                                <i className="bi bi-dash"></i>
                                Unknown
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusClass(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td>
                            {payment.status.toLowerCase() === 'paid' && user && selectedPackage ? (
                              <InvoiceGenerator 
                                payment={payment} 
                                student={user} 
                                packageDetails={selectedPackage}
                                allPayments={paymentHistory}
                              />
                            ) : payment.status.toLowerCase() === 'paid' ? (
                              <button 
                                className="invoice-btn"
                                disabled={true}
                                title="Loading user data..."
                              >
                                <i className="bi bi-file-earmark-pdf"></i>
                                <span>Invoice</span>
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>No payment records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h3>Make a Payment</h3>
              <button className="modal-close-btn" onClick={closePaymentModal}>×</button>
            </div>
            
            <div className="payment-modal-body">
              <div className="payment-summary">
                <div className="summary-item">
                  <span>Package:</span>
                  <span>{selectedPackage.packageName}</span>
                </div>
                <div className="summary-item">
                  <span>Total Price:</span>
                  <span>{formatCurrency(selectedPackage.price)}</span>
                </div>
                <div className="summary-item">
                  <span>Already Paid:</span>
                  <span>{formatCurrency(alreadyPaid)}</span>
                </div>
                <div className="summary-item highlight">
                  <span>Remaining Balance:</span>
                  <span>{formatCurrency(remainingAmount)}</span>
                </div>
              </div>

              <div className="payment-form">
                <div className="form-group">
                  <label>Enter Payment Amount</label>
                  <input
                    type="number"
                    min="1"
                    max={remainingAmount}
                    step="1"
                    value={paymentAmount}
                    onChange={handlePaymentChange}
                    placeholder={`Enter amount (max ${formatCurrency(remainingAmount)})`}
                  />
                </div>
                
                <div className="form-group">
                  <label>Select Payment Method</label>
                  <div className="payment-methods">
                    <div 
                      className={`payment-method-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                      onClick={() => handlePaymentMethodChange('card')}
                    >
                      <div className="payment-method-icon">
                        <i className="bi bi-credit-card"></i>
                      </div>
                      <span>Card Payment</span>
                    </div>
                    <div 
                      className={`payment-method-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                      onClick={() => handlePaymentMethodChange('cash')}
                    >
                      <div className="payment-method-icon">
                        <i className="bi bi-cash"></i>
                      </div>
                      <span>Cash Payment</span>
                    </div>
                    <div 
                      className={`payment-method-option ${paymentMethod === 'bank' ? 'selected' : ''}`}
                      onClick={() => handlePaymentMethodChange('bank')}
                    >
                      <div className="payment-method-icon">
                        <i className="bi bi-bank"></i>
                      </div>
                      <span>Bank Transfer</span>
                    </div>
                  </div>
                </div>
                
                {paymentMethod === 'bank' && (
                  <div className="bank-info-box">
                    <h4>Bank Account Details</h4>
                    <p><strong>Account Name:</strong> Madushani Driving School</p>
                    <p><strong>Account Number:</strong> +94 76 360 8450</p>
                    <p><strong>Bank Name:</strong> Bank of Ceylon</p>
                    <p><strong>Branch:</strong> Bandarawela</p>
                    <p className="bank-note">Please include your name and student ID as reference</p>
                  </div>
                )}
                
                {paymentError && <div className="error-message">{paymentError}</div>}
              </div>
            </div>
            
            <div className="payment-modal-footer">
              <button className="cancel-btn" onClick={closePaymentModal}>Cancel</button>
              <button 
                className="confirm-btn" 
                onClick={handleConfirmPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingAmount}
              >
                Pay {paymentAmount ? formatCurrency(paymentAmount) : formatCurrency(0)}
                {paymentAmount ? ` via ${getPaymentMethodDisplay(paymentMethod)}` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;