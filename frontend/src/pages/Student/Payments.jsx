import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Payments.css';
import '../../components/Sidebar.css';

const Payments = () => {
  const { user } = useAuth();
  const mockPayments = [
    { id: 1, date: "2023-10-01", amount: "$50.00", status: "Paid" },
    { id: 2, date: "2023-09-15", amount: "$125.00", status: "Paid" },
    { id: 3, date: "2023-09-01", amount: "$75.50", status: "Pending" },
    { id: 4, date: "2023-08-15", amount: "$225.00", status: "Failed" },
  ];
  
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
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        
        {/* Main content */}
        <div className="dashboard-content">
          <div className="content-wrapper">
            {/* Header with title */}
            <div className="dashboard-header">
              <div className="greeting-section">
                <h1 className="welcome-header">
                  Payment History
                </h1>
                <p className="greeting-subtitle">View and manage all your transaction records</p>
              </div>
            </div>
            
            {/* Payment content */}
            <div className="payments-container">
              <div className="payments-header">
                <h2>Transaction Records</h2>
                <span className="payments-count">{mockPayments.length} transactions</span>
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
                    {mockPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.date)}</td>
                        <td className="amount-cell">{payment.amount}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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