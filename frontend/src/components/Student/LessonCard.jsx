// src/components/Student/LessonCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LessonCard = ({ lesson }) => {
    const navigate = useNavigate();
    
  return (
    <div className="lesson-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5 mb-0 text-primary">{lesson.date}</h3>
        <span className={`badge ${lesson.status === 'Upcoming' ? 'bg-warning text-dark' : 'bg-success'} status-badge`}>
          {lesson.status}
        </span>
      </div>
      <div className="card-body p-0">
        <p className="mb-2">
          <i className="bi bi-person me-2"></i>
          {lesson.instructor}
        </p>
        <p className="mb-0">
          <i className="bi bi-car me-2"></i>
          {lesson.vehicle}
        </p>
      </div>
    </div>
  );
};

export default LessonCard;