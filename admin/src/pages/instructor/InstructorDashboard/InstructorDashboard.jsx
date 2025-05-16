import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './InstructorDashboard.module.css';
import InstructorSidebar from '../../../components/Sidebar/InstructorSidebar';import { Users, Calendar, LogOut } from 'lucide-react'; 

ChartJS.register(ArcElement, Tooltip, Legend);

function InstructorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    assignedStudents: 0,
    scheduledSessions: 0,
    completedSessions: 0,
    upcomingSessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/instructor/sign-in');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8081/api/instructorDashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({
          ...response.data.data,
          scheduledSessions: Number(response.data.data.scheduledSessions) || 0,
          completedSessions: Number(response.data.data.completedSessions) || 0
        });
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Pie chart data configuration for today's sessions
  const pieChartData = {
    labels: ['Scheduled', 'Completed'],
    datasets: [
      {
        data: [stats.scheduledSessions, stats.completedSessions],
        backgroundColor: ['#FF6384', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#4BC0C0'],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <div className="dashboard-layout">
      <InstructorSidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-content">
          <div className="page-header">
            <h1>Instructor Dashboard</h1>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} className="logout-icon" />
              Logout
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper primary">
                <Users size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Students</h3>
                <p className="stat-value">{stats.totalStudents}</p>
                <p className="stat-change">All students in system</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper success">
                <Users size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Your Students</h3>
                <p className="stat-value">{stats.assignedStudents}</p>
                <p className="stat-change">Assigned to you</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper info">
                <Calendar size={22} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Today's Sessions</h3>
                <p className="stat-value">
                  {stats.scheduledSessions + stats.completedSessions}
                </p>
                <p className="stat-change">
                  {stats.completedSessions} completed, {stats.scheduledSessions} upcoming
                </p>
              </div>
            </div>
          </div>

          <div className="horizontal-section">
            <div className="chart-section">
              <h2>Today's Session Status</h2>
              <div className="pie-chart-container">
                {stats.scheduledSessions === 0 && stats.completedSessions === 0 ? (
                  <div className="no-sessions-chart">No sessions today</div>
                ) : (
                  <Pie data={pieChartData} options={pieChartOptions} />
                )}
              </div>
            </div>

            <div className="sessions-section">
              <h2>Today's Sessions ({new Date().toLocaleDateString()})</h2>
              <div className="sessions-grid">
                {stats.upcomingSessions.length === 0 ? (
                  <div className="no-sessions">No sessions scheduled for today</div>
                ) : (
                  stats.upcomingSessions.slice(0, 6).map(session => (
                    <div key={session.booking_id} className="session-card">
                      <div className="session-header">
                        <span className="student-names">
                          {session.first_name} {session.last_name}
                        </span>
                        <span className="session-time">{session.time_slot}</span>
                      </div>
                      <div className="session-details">
                        <span className="session-vehicle">{session.vehicle}</span>
                        <span className={`session-status ${session.status.toLowerCase()}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;