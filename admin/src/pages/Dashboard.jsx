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
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../components/Sidebar/Sidebar';
import { BookOpen, Users, Calendar, DollarSign, LogOut } from 'lucide-react';

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
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInstructors: 0,
    upcomingExams: 0,
    totalRevenue: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/admin/sign-in');
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchMonthlyStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/dashboard/payment-stats");
      setMonthlyStats(response.data.monthlyStats || []);
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
        label: 'Monthly Revenue (LKR)',
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
        label: 'Number of Payments',
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

  // Calculate current month revenue
  const currentMonthRevenue = monthlyStats.length > 0 
    ? monthlyStats[monthlyStats.length - 1].total_amount 
    : 0;

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-content">
          <div className="page-header">
            <h1>Admin Dashboard</h1>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} className="logout-icon" />
              Logout
            </button>
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
              <div className="stat-icon-wrapper info">
                <DollarSign size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Revenue</h3>
                <p className="stat-value">LKR {stats.totalRevenue}</p>
                <p className="stat-change positive">+4.7% from last month</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper warning">
                <DollarSign size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">This Month's Revenue</h3>
                <p className="stat-value">LKR {currentMonthRevenue}</p>
                <p className="stat-change positive">
                  {monthlyStats.length > 1 ? 
                    `+${Math.round(((currentMonthRevenue - monthlyStats[monthlyStats.length - 2].total_amount) / 
                      monthlyStats[monthlyStats.length - 2].total_amount) * 100)}% from last month` 
                    : 'No previous data'}
                </p>
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
            ) : monthlyStats.length > 0 ? (
              <div className="charts-row">
                <div className="chart-section">
                  <div className="section-header">
                    <h2>Monthly Revenue Breakdown</h2>
                  </div>
                  <div className="chart-container">
                    <Bar data={revenueChartData} options={chartOptions} height={350} />
                  </div>
                </div>
                
                <div className="chart-section">
                  <div className="section-header">
                    <h2>Monthly Payment Activity</h2>
                  </div>
                  <div className="chart-container">
                    <Bar data={paymentsChartData} options={chartOptions} height={350} />
                  </div>
                </div>
              </div>
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