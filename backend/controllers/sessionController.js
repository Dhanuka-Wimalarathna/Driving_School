import {
  getStudentProgressSummary,
  markSessionCompleted
} from '../models/sessionModel.js';

export const getStudentProgressDetails = (req, res) => {
  const studentId = req.params.studentId;
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  getStudentProgressSummary(studentId, (err, summary) => {
    if (err) {
      console.error("Error fetching progress:", err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.json({ summary });
  });
};

export const markSessionCompletedCtrl = (req, res) => {
  const { studentId, vehicleId } = req.body;

  if (!studentId || !vehicleId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  markSessionCompleted(studentId, vehicleId, (err, result) => {
    if (err) {
      console.error("Error marking session:", err);
      return res.status(400).json({ error: err.message });
    }
    
    res.json({ 
      success: true,
      summary: result.summary,
      vehicleProgress: result.vehicleProgress,
      message: result.allCompleted 
        ? 'All sessions completed! Student is now eligible for final test.' 
        : 'Session marked as completed successfully!'
    });
  });
};