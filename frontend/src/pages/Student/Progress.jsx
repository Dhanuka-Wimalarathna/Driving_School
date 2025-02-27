import React from 'react';
import ProgressBar from '../../components/Student/ProgressBar';

const Progress = () => {
  return (
    <div className="progress-page">
      <h2>Your Progress</h2>
      <ProgressBar completed={3} total={10} />
    </div>
  );
};

export default Progress;