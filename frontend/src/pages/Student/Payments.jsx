import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Payments.css';
import '../../components/Sidebar.css';
import { useNavigate } from 'react-router-dom';


const Payments = () => {
  const { user } = useAuth();
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
        
        // Filter only successful payments and parse amounts
        const successfulPayments = payments
          .filter(p => p.status.toLowerCase() === 'paid')
          .map(p => ({
            ...p,
            amount: parseFloat(p.amount)
          }));
        
        setPaymentHistory(successfulPayments);
        
        // Calculate total paid amount
        const paidTotal = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
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

  const validatePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount)) {
      setPaymentError('Please enter a valid number');
      return false;
    }
    if (amount <= 0) {
      setPaymentError('Amount must be greater than 0');
      return false;
    }
    if (amount > remainingAmount) {
      setPaymentError(`Amount cannot exceed remaining balance (${formatCurrency(remainingAmount)})`);
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
      
      // Optimistic update
      const newPayment = {
        id: Date.now(), // temporary ID
        amount,
        date: new Date().toISOString(),
        status: 'paid',
        method: paymentMethod // Add payment method to the local state
      };

      const newPaidTotal = alreadyPaid + amount;
      const newRemaining = Math.max(0, parseFloat(selectedPackage.price) - newPaidTotal);

      setAlreadyPaid(newPaidTotal);
      setRemainingAmount(newRemaining);
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
            paymentMethod: paymentMethod // Include payment method in API request
          })
        }
      );

      if (!response.ok) throw new Error('Payment failed');

      // Final data refresh
      setPaymentAmount('');
      setShowPaymentModal(false);
      fetchData();
      
      alert(`Payment of ${formatCurrency(amount)} via ${paymentMethod} successful!`);
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError('Payment failed. Please try again.');
      // Rollback optimistic update
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
    return Math.min(100, (alreadyPaid / parseFloat(selectedPackage.price)) * 100);
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
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.length > 0 ? (
                      paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td>{formatDate(payment.date)}</td>
                          <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center' }}>No payment records found.</td>
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
                    <p><strong>Account Number:</strong> 1234567890</p>
                    <p><strong>Bank Name:</strong> Bank of Ceylon</p>
                    <p><strong>Branch:</strong> Colombo</p>
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