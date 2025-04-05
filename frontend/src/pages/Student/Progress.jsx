import React from 'react';
import Sidebar from '../../components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Progress.css';

const Progress = () => {
  const completed = 3;
  const total = 10;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="progress-container">
      <div className="progress-layout">
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="progress-content">
          <div className="progress-wrapper">
            <div className="progress-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">Your Progress</h1>
                  <p className="page-subtitle">Track your driving lessons progress</p>
                </div>
              </div>
            </div>

            <div className="progress-grid">
              {/* Progress Card */}
              <div className="progress-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-speedometer2"></i>
                    Driving Lessons Progress
                  </h2>
                </div>
                <div className="card-body">
                  {/* Integrated ProgressBar */}
                  <div className="custom-progress-bar">
                    <div className="bar-background">
                      <div className="bar-fill" style={{ width: `${percentage}%` }}>
                        {percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="progress-info">
                    <p>You've completed {completed} out of {total} lessons.</p>
                    <p>Keep up the good work!</p>
                  </div>
                </div>
              </div>

              {/* Skills Progress Card */}
              <div className="progress-card skills-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-star"></i>
                    Skills Overview
                  </h2>
                </div>
                <div className="card-body">
                  <div className="skills-progress">
                    {[
                      { name: 'Parking', level: 70 },
                      { name: 'Highway Driving', level: 45 },
                      { name: 'Traffic Navigation', level: 60 },
                      { name: 'Reversing', level: 50 },
                    ].map(skill => (
                      <div className="skill-item" key={skill.name}>
                        <div className="skill-label">{skill.name}</div>
                        <div className="skill-bar-container">
                          <div className="skill-bar" style={{ width: `${skill.level}%` }}>
                            {skill.level}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
