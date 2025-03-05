import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-content">
        {/* Logo */}
        <div className="logo-container">
          <span className="logo">
            <i className="bi bi-speedometer2"></i>
            <span className="logo-text">Madushani Driving School</span>
          </span>
        </div>
        
        {/* Navigation Links */}
        <div className="nav-links">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-house-door"></i>
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/student/package"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-box"></i>
            <span>Package</span>
          </NavLink>
          
          <NavLink
            to="/student/progress"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-graph-up"></i>
            <span>Progress</span>
          </NavLink>
          
          <NavLink
            to="/student/payments"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-credit-card"></i>
            <span>Payments</span>
          </NavLink>
        </div>
        
        {/* Bottom section */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-info">
              <h6>Student</h6>
              <p>View Profile</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
