import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  createTrialExam as createTrialExamModel,
  getTrialExamsByStudent,
  updateTrialExamStatus as updateTrialExamStatusModel,
  deleteTrialExam as deleteTrialExamModel,
  getAllTrialStudents,
  updateTrialExam as updateTrialExamModel
} from '../models/trialModel.js';

dotenv.config();

export const createTrialExam = (req, res) => {
  const { studentId, vehicleType, examDate, examTime } = req.body;

  if (!studentId || !vehicleType || !examDate || !examTime) {
    return res.status(400).json({
      success: false,
      error: 'Student ID, vehicle type, exam date and exam time are required'
    });
  }

  createTrialExamModel(studentId, vehicleType, examDate, examTime, (err, result) => {
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

export const getStudentTrialExams = (req, res) => {
  try {
    let studentId = req.query.id || req.userId;
    
    console.log("Auth middleware provided userId:", req.userId);
    console.log("Query parameter id:", req.query.id);
    console.log("Using studentId:", studentId);
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    getTrialExamsByStudent(studentId, (err, results) => {
      if (err) {
        console.error('Error fetching student trial exams:', err);
        return res.status(500).json({
          success: false,
          error: err.message || 'Failed to fetch trial exams'
        });
      }
      
      res.status(200).json({
        success: true,
        data: results || []
      });
    });
  } catch (error) {
    console.error('Exception in getStudentTrialExams:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

export const fetchAllTrialStudents = (req, res) => {
  getAllTrialStudents((err, results) => {
    if (err) {
      console.error('Error fetching all trial students:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch all trial students'
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  });
};