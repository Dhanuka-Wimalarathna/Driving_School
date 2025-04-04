import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../components/Sidebar/Sidebar';

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInstructors: 0,
    upcomingExams: 0,
    revenue: 0,
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <header className="header">
          <div className="search-container">
            <input type="text" className="search-input" placeholder="Search..." />
            <span className="search-icon">🔍</span>
          </div>
          <div className="header-right">
            <div className="notification">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">3</span>
            </div>
            <div className="user-menu">
              <img src="https://via.placeholder.com/40" alt="User" className="user-avatar" />
              <span className="user-name">Admin User</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-title">
            <h1>Dashboard Overview</h1>
            <div className="date-selector">
              <select>
                <option>Today</option>
                <option>This Week</option>
                <option defaultValue>This Month</option>
                <option>This Year</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-info">
                <h3 className="stat-title">Total Students</h3>
                <p className="stat-value">{stats.totalStudents}</p>
                <p className="stat-change positive">↑ from last month</p>
              </div>
              <div className="stat-icon">👨‍🎓</div>
            </div>

            <div className="stat-card success">
              <div className="stat-info">
                <h3 className="stat-title">Active Instructors</h3>
                <p className="stat-value">{stats.activeInstructors}</p>
                <p className="stat-change positive">↑ from last month</p>
              </div>
              <div className="stat-icon">👨‍🏫</div>
            </div>

            <div className="stat-card warning">
              <div className="stat-info">
                <h3 className="stat-title">Upcoming Exams</h3>
                <p className="stat-value">{stats.upcomingExams}</p>
                <p className="stat-change negative">↓ from last month</p>
              </div>
              <div className="stat-icon">📝</div>
            </div>

            <div className="stat-card info">
              <div className="stat-info">
                <h3 className="stat-title">Revenue</h3>
                <p className="stat-value">${stats.revenue}</p>
                <p className="stat-change positive">↑ from last month</p>
              </div>
              <div className="stat-icon">💵</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
