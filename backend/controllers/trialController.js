import {
  createTrialExam as createTrialExamModel,
  getTrialExamsByStudent,
  updateTrialExamStatus as updateTrialExamStatusModel,
  deleteTrialExam as deleteTrialExamModel,
  getAllTrialStudents,
  updateTrialExam as updateTrialExamModel
} from '../models/trialModel.js';

export const createTrialExam = (req, res) => {
  const { studentId, vehicleType } = req.body;

  if (!studentId || !vehicleType) {
    return res.status(400).json({
      success: false,
      error: 'Student ID and vehicle type are required'
    });
  }

  createTrialExamModel(studentId, vehicleType, (err, result) => {
    if (err) {
      console.error('Error creating trial exam:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Failed to create trial exam'
      });
    }
    
    res.status(201).json({
      success: true,
      data: result
    });
  });
};

export const getTrialExams = (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      error: 'Student ID is required'
    });
  }

  getTrialExamsByStudent(studentId, (err, results) => {
    if (err) {
      console.error('Error fetching trial exams:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Failed to fetch trial exams'
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  });
};

export const updateTrialExamStatus = (req, res) => {
  const examId = req.params.id;
  const { status } = req.body;

  if (!examId || !status) {
    return res.status(400).json({
      success: false,
      error: 'Exam ID and status are required'
    });
  }

  updateTrialExamStatusModel(examId, status, (err, result) => {
    if (err) {
      console.error('Error updating trial exam status:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Failed to update trial exam status'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  });
};

export const deleteTrialExam = (req, res) => {
  const examId = req.params.id;

  deleteTrialExamModel(examId, (err, result) => {
    if (err) {
      console.error('Error deleting trial exam:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Failed to delete trial exam'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  });
};

export const getTrialStudentsDetails = (req, res) => {
  getAllTrialStudents((err, results) => {
    if (err) {
      console.error('Error fetching trial students:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch trial students'
      });
    }
    
    console.log('Sending trial students data:', results);
    res.status(200).json({
      success: true,
      data: results
    });
  });
};

export const updateTrialExam = (req, res) => {
  const { studentId, vehicleType, examDate, examTime, status, result } = req.body;

  if (!studentId || !vehicleType) {
    return res.status(400).json({
      success: false,
      error: 'Student ID and vehicle type are required'
    });
  }

  // Create an object with only the fields that are provided
  const updateData = {};
  if (examDate) updateData.exam_date = examDate;
  if (examTime) updateData.exam_time = examTime;
  if (status) updateData.status = status;
  if (result) updateData.result = result;  // Add this line

  // Check if there's anything to update
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update provided'
    });
  }

  // Add the model function to update the database
  updateTrialExamModel(studentId, vehicleType, updateData, (err, result) => {
    if (err) {
      console.error('Error updating trial exam:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to update trial exam'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trial exam updated successfully',
      data: result
    });
  });
};

// Add this new controller function
export const getStudentTrialExam = (req, res) => {
  const studentId = req.params.studentId;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      error: 'Student ID is required'
    });
  }

  const sql = `
    SELECT te.*, 
           s.FIRST_NAME as student_first_name, 
           s.LAST_NAME as student_last_name,
           GROUP_CONCAT(DISTINCT te.vehicle_type) as vehicle_types
    FROM trial_exams te
    JOIN student s ON te.stu_id = s.STU_ID
    WHERE te.stu_id = ?
    GROUP BY te.exam_date, te.exam_time, te.status, te.result
    ORDER BY te.created_at DESC
    LIMIT 1
  `;

  sqldb.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching student trial exam:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch trial exam details'
      });
    }

    // For debugging
    console.log('Trial exam query results:', results);

    if (results && results.length > 0) {
      // Process vehicle types if needed
      if (results[0].vehicle_types) {
        results[0].vehicle_types = results[0].vehicle_types.split(',');
      }
    }

    res.status(200).json({
      success: true,
      data: results[0] || null
    });
  });
};