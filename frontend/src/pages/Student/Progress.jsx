import React from 'react';
import Sidebar from '../../components/Sidebar';
import ProgressBar from '../../components/Student/ProgressBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Progress.css';
import '../../components/Sidebar.css';  // Assuming this file contains the sidebar styles

const Progress = () => {
  return (
    <div className="progress-page-wrapper">
      <div className="progress-page-layout">
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="progress-page-content">
          <div className="content-wrapper">
            <h2 className="page-title">Your Progress</h2>

            <div className="progress-card">
              <div className="card-header">
                <h3 className="card-title">Driving Lessons Progress</h3>
              </div>
              <div className="card-body">
                <ProgressBar completed={3} total={10} />
                <div className="progress-info">
                  <p>You've completed 3 out of 10 lessons.</p>
                  <p>Keep up the good work!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
