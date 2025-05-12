import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import './Dashboard.css';
import Sidebar from '../components/Sidebar/Sidebar';
import { BookOpen, Users, Calendar, DollarSign } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInstructors: 0,
    upcomingExams: 0,
    revenue: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchPaymentStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/dashboard/payment-stats");
      
      // Extract monthly stats and summary
      setMonthlyStats(response.data.monthlyStats || []);
      setPaymentSummary({
        total_transactions: response.data.total_transactions,
        total_revenue: response.data.total_revenue,
        paid_students: response.data.paid_students,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      setLoading(false);
    }
  };

  // Revenue Chart Data
  const revenueChartData = {
    labels: monthlyStats.map(item => item.month),
    datasets: [
      {
        label: '  Total Revenue (LKR.)',
        data: monthlyStats.map(item => item.total_amount),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Payments Count Chart Data
  const paymentsChartData = {
    labels: monthlyStats.map(item => item.month),
    datasets: [
      {
        label: '  Number of Payments',
        data: monthlyStats.map(item => item.payment_count),
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        padding: 12,
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: '600'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 1)',
          borderDash: [5, 5]
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-content">
          <div className="page-header">
            <h1>Dashboard Overview</h1>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper primary">
                <Users size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Students</h3>
                <p className="stat-value">{stats.totalStudents}</p>
                <p className="stat-change positive">+3.2% from last month</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper success">
                <BookOpen size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Active Instructors</h3>
                <p className="stat-value">{stats.activeInstructors}</p>
                <p className="stat-change positive">+2.1% from last month</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper warning">
                <Calendar size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Upcoming Exams</h3>
                <p className="stat-value">{stats.upcomingExams}</p>
                <p className="stat-change negative">-1.5% from last month</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper info">
                <DollarSign size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Revenue</h3>
                <p className="stat-value">
                  LKR {paymentSummary ? paymentSummary.total_revenue : 'Loading...'}
                </p>
                <p className="stat-change positive">+4.7% from last month</p>
              </div>
            </div>
          </div>

          {/* Payment Charts Section */}
          <div className="charts-container">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading payment data...</p>
              </div>
            ) : paymentSummary ? (
              <>
                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Total Transactions</h4>
                    <p>{paymentSummary.total_transactions}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Total Revenue</h4>
                    <p>LKR {paymentSummary.total_revenue}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Paid Students</h4>
                    <p>{paymentSummary.paid_students}</p>
                  </div>
                </div>
                
                <div className="charts-row">
                  {/* Revenue Chart */}
                  <div className="chart-section">
                    <div className="section-header">
                      <h2>Monthly Revenue</h2>
                    </div>
                    <div className="chart-container">
                      <Bar data={revenueChartData} options={chartOptions} height={250} />
                    </div>
                  </div>
                  
                  {/* Payments Count Chart */}
                  <div className="chart-section">
                    <div className="section-header">
                      <h2>Monthly Payment Count</h2>
                    </div>
                    <div className="chart-container">
                      <Bar data={paymentsChartData} options={chartOptions} height={250} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>No payment data available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;