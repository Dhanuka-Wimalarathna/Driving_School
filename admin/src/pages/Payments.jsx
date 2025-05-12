import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, Trash2, Eye, AlertCircle } from 'lucide-react';
import './Payments.css';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

      const response = await axios.get("http://localhost:8081/api/payments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const formattedPayments = response.data.map(payment => ({
        ...payment,
        receiptNumber: `PAY-${payment.payment_id.toString().padStart(6, '0')}`,
        transaction_date: new Date(payment.transaction_date).toLocaleDateString()
      }));

      setPayments(formattedPayments);
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

  const deletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/sign-in');
        return;
      }

      await axios.delete(`http://localhost:8081/api/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Optimistic UI update
      setPayments(payments.filter(payment => payment.payment_id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete payment.");
    }
  };

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/sign-in');
        return;
      }

      await axios.put(
        `http://localhost:8081/api/payments/${id}/status`,
        { status: newStatus },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      // Optimistic UI update
      setPayments(payments.map(payment => 
        payment.payment_id === id ? { ...payment, status: newStatus } : payment
      ));
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "Failed to update status.");
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-layout">
      <main className="payments-main-content">
        <div className="payments-container">
          <header className="payments-header">
            <div className="header-title">
              <h1>
                <CreditCard size={24} />
                Payment Records
              </h1>
              <p className="subtitle">
                Showing {filteredPayments.length} payments
              </p>
            </div>
            
            <div className="search-filter-wrapper">
              <div className="search-container">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search by receipt number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </header>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading payments...</p>
            </div>
          ) : errorMessage ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <p>{errorMessage}</p>
              <button onClick={fetchPayments}>Retry</button>
            </div>
          ) : (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Student ID</th>
                  <th>Package ID</th>
                  <th>Amount</th>
                  <th>Transaction Date</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment.payment_id}>
                    <td>{payment.receiptNumber}</td>
                    <td>{payment.student_id}</td>
                    <td>{payment.package_id}</td>
                    <td>${payment.amount.toFixed(2)}</td>
                    <td>{payment.transaction_date}</td>
                    <td>{payment.transaction_id || '-'}</td>
                    <td>
                      <select
                        value={payment.status}
                        onChange={(e) => updatePaymentStatus(payment.payment_id, e.target.value)}
                        className={`status-${payment.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => navigate(`/payments/${payment.payment_id}`)}
                        aria-label="View payment details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => deletePayment(payment.payment_id)}
                        aria-label="Delete payment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Payments;