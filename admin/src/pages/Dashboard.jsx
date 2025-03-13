import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../components/Sidebar/Sidebar';

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard-layout">
      {/* Use the Sidebar component */}
      <Sidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
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
              <img 
                src="https://via.placeholder.com/40" 
                alt="User" 
                className="user-avatar" 
              />
              <span className="user-name">Admin User</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="page-title">
            <h1>Dashboard Overview</h1>
            <div className="date-selector">
              <select>
                <option>Today</option>
                <option>This Week</option>
                <option selected>This Month</option>
                <option>This Year</option>
              </select>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-info">
                <h3 className="stat-title">Total Students</h3>
                <p className="stat-value">150</p>
                <p className="stat-change positive">↑ 12% from last month</p>
              </div>
              <div className="stat-icon">👨‍🎓</div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-info">
                <h3 className="stat-title">Active Instructors</h3>
                <p className="stat-value">10</p>
                <p className="stat-change positive">↑ 5% from last month</p>
              </div>
              <div className="stat-icon">👨‍🏫</div>
            </div>
            
            <div className="stat-card warning">
              <div className="stat-info">
                <h3 className="stat-title">Upcoming Exams</h3>
                <p className="stat-value">5</p>
                <p className="stat-change negative">↓ 3% from last month</p>
              </div>
              <div className="stat-icon">📝</div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-info">
                <h3 className="stat-title">Revenue</h3>
                <p className="stat-value">$5,000</p>
                <p className="stat-change positive">↑ 8% from last month</p>
              </div>
              <div className="stat-icon">💵</div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h3 className="section-title">Student Enrollment</h3>
              <div className="chart-placeholder">
                <p>Student enrollment chart will be displayed here</p>
              </div>
            </div>
            
            <div className="chart-container">
              <h3 className="section-title">Revenue Overview</h3>
              <div className="chart-placeholder">
                <p>Revenue chart will be displayed here</p>
              </div>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div className="activities-section">
            <h3 className="section-title">Recent Activities</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon student">👨‍🎓</div>
                <div className="activity-details">
                  <p className="activity-text">New student <strong>John Doe</strong> registered</p>
                  <p className="activity-time">2 hours ago</p>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon payment">💰</div>
                <div className="activity-details">
                  <p className="activity-text">Payment of <strong>$250</strong> received from <strong>Sarah Johnson</strong></p>
                  <p className="activity-time">3 hours ago</p>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon exam">📝</div>
                <div className="activity-details">
                  <p className="activity-text">Driving test for <strong>Mike Smith</strong> scheduled</p>
                  <p className="activity-time">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;