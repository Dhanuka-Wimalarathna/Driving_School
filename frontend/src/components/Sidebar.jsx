import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfile = () => {
    navigate('/student/profile');
    setShowDropdown(false);
  };
  
  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem('token'); // Adjust based on your auth implementation
    navigate('/login');
  };

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
            <span>Packages</span>
          </NavLink>
          
          {/* New Schedule Navigation Item */}
          <NavLink
            to="/student/booking"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className="bi bi-calendar2-week"></i>
            <span>Schedule</span>
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
        
        {/* Bottom section with dropdown */}
        <div className="sidebar-footer" ref={dropdownRef}>
          <div 
            className="user-profile"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-info">
              <h6>Student</h6>
            </div>
          </div>
          
          {showDropdown && (
            <div className="profile-dropdown">
              <button className="dropdown-item" onClick={handleProfile}>
                <i className="bi bi-person"></i>
                <span>Profile</span>
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
