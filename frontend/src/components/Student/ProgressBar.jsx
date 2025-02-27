// src/components/Student/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ completed, total }) => {
  const percentage = (completed / total) * 100;

  return (
    <div className="progress-bar-container bg-light">
      <div 
        className="progress-bar-fill" 
        style={{ width: `${percentage}%` }}
      >
        <span className="text-white ps-3 fw-medium">
          {completed}/{total} Lessons
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;