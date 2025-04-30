import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Payments.css';
import '../../components/Sidebar.css';

const Payments = () => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  
  // localStorage.setItem('token', response.token);

  useEffect(() => {
    // Fetch selected package
    fetch('http://localhost:8081/api/select-package/get-selected-package', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (!data.message) { // If no error message
        setSelectedPackage(data);
      }
    })
    .catch(err => console.error('Error fetching selected package:', err));

    // Fetch payment history (dummy for now, you can replace with real API)
    fetch('http://localhost:8081/api/student/payments', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    .then(res => res.json())
    .then(data => setPaymentHistory(data))
    .catch(err => console.error('Error fetching payment history:', err));
  }, []);

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

  const handlePaymentClick = () => {
    console.log('Redirecting to payment page...');
    // You can navigate to a payment page here or trigger a payment modal
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
            {selectedPackage ? (
              <div className="selected-package">
                <h2>Your Selected Package</h2>
                <p className="package-name">{selectedPackage.packageName}</p>
                <p className="package-price">Rs.{selectedPackage.price}</p>
                <button className="make-payment-btn" onClick={handlePaymentClick}>
                  Make Payment
                </button>
              </div>
            ) : (
              <div className="selected-package">
                <p>You have not selected any package yet.</p>
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
                          <td className="amount-cell">${payment.amount}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(payment.status)}`}>
                              {payment.status}
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
    </div>
  );
};

export default Payments;
