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
            to="/admin/dashboard"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-house-door"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/students"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-people"></i>
            <span>Students</span>
          </NavLink>

          <NavLink
            to="/admin/instructors"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-person-badge"></i>
            <span>Instructors</span>
          </NavLink>

          <NavLink
            to="/admin/vehicles"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-car-front"></i>
            <span>Vehicles</span>
          </NavLink>

          <NavLink
            to="/admin/package"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-box"></i>
            <span>Packages</span>
          </NavLink>

          <NavLink
            to="/admin/payments"
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
              <h6>Admin</h6>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;