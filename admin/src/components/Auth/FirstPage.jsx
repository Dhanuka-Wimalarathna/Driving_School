import React from 'react';
import { Link } from 'react-router-dom';
import './FirstPage.css';

const FirstPage = () => {
  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <div className="school-header">
          <h1 className="school-name">Madushani Driving School</h1>
          <img 
            src="images/icon02.png" 
            alt="Driving School Logo" 
            className="school-logo"
          />
        </div>
        
        <div className="cards-container">
          <div className="role-card">
            <h2 className="role-title">Admin</h2>
            <p className="role-description">School management, user accounts, and administrative tasks</p>
            <div className="card-actions">
              <Link to="/admin/sign-in" className="auth-button">
                Sign In
              </Link>
              <Link to="/admin/sign-up" className="auth-button secondary">
                Sign Up
              </Link>
            </div>
          </div>
          
          <div className="role-card">
            <h2 className="role-title">Instructor</h2>
            <p className="role-description">Manage classes, schedules, and student progress</p>
            <div className="card-actions">
              <Link to="/instructor/sign-in" className="auth-button">
                Sign In
              </Link>
              <Link to="/instructor/sign-up" className="auth-button secondary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstPage;