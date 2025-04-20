import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css"; // Reuse the existing CSS

const InstructorSidebar = () => {
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
            to="/instructor/dashboard"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-house-door"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/instructor/lessons"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-calendar-check"></i>
            <span>Lessons</span>
          </NavLink>

          <NavLink
            to="/instructor/schedule"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-clock"></i>
            <span>Schedule</span>
          </NavLink>

          <NavLink
            to="/instructor/students"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-people"></i>
            <span>My Students</span>
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
        </div>

        {/* Bottom Section */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-info">
              <h6>Instructor</h6>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default InstructorSidebar;
