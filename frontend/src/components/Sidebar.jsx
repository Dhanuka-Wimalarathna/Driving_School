import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="sidebar bg-dark text-white vh-100 p-3 position-fixed start-0">
      <div className="d-flex flex-column gap-3">
        {/* Logo */}
        <div className="text-center mb-4">
          <span className="fs-4 fw-bold text-primary">
            <i className="bi bi-speedometer2 me-2"></i>
            Madushani Driving School
          </span>
        </div>

        {/* Navigation Links */}
        <NavLink 
          to="/student" 
          end  /* Ensures only this exact route is active */
          className={({ isActive }) => 
            `nav-link d-flex align-items-center gap-2 p-3 rounded ${isActive ? 'bg-primary text-white' : 'text-white-50 hover-bg'}`
          }
        >
          <i className="bi bi-house-door fs-5"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/student/booking" 
          end  /* Ensures only this exact route is active */
          className={({ isActive }) => 
            `nav-link d-flex align-items-center gap-2 p-3 rounded ${isActive ? 'bg-primary text-white' : 'text-white-50 hover-bg'}`
          }
        >
          <i className="bi bi-calendar-plus fs-5"></i>
          <span>Book Lesson</span>
        </NavLink>

        <NavLink 
          to="/student/progress" 
          end
          className={({ isActive }) => 
            `nav-link d-flex align-items-center gap-2 p-3 rounded ${isActive ? 'bg-primary text-white' : 'text-white-50 hover-bg'}`
          }
        >
          <i className="bi bi-graph-up fs-5"></i>
          <span>Progress</span>
        </NavLink>

        <NavLink 
          to="/student/payments" 
          end
          className={({ isActive }) => 
            `nav-link d-flex align-items-center gap-2 p-3 rounded ${isActive ? 'bg-primary text-white' : 'text-white-50 hover-bg'}`
          }
        >
          <i className="bi bi-credit-card fs-5"></i>
          <span>Payments</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Sidebar;
