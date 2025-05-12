import {
  getStudentProgressSummary,
  markSessionCompleted
} from '../models/sessionModel.js';

export const getStudentProgressDetails = (req, res) => {
  const studentId = req.params.studentId;
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Prevent caching
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  getStudentProgressSummary(studentId, (err, summary) => {
    if (err) {
      console.error("Error fetching progress:", err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.json({ summary });
  });
};

export const markSessionCompletedCtrl = (req, res) => {
  const { studentId, vehicleType } = req.body; // Changed from vehicleId to vehicleType

  if (!studentId || !vehicleType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate vehicleType
  const validTypes = ['Bike', 'Three-Wheeler', 'Van'];
  if (!validTypes.includes(vehicleType)) {
    return res.status(400).json({ error: 'Invalid vehicle type' });
  }

  markSessionCompleted(studentId, vehicleType, (err, result) => {
    if (err) {
      console.error("Error marking session:", err);
      return res.status(400).json({ error: err.message });
    }
    
    res.json({ 
      success: true,
      summary: result.summary,
      vehicleProgress: result.vehicleProgress,
      message: result.allCompleted 
        ? `All ${vehicleType} sessions completed!` 
        : `${vehicleType} session marked as completed successfully!`
    });
  });
};