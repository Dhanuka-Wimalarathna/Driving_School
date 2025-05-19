import sqldb from "../config/sqldb.js";

export const createTrialExam = (studentId, vehicleType, examDate, examTime, callback) => {
  const checkSql = `
    SELECT * FROM trial_exams 
    WHERE stu_id = ? AND vehicle_type = ? 
    AND status IN ('Pending', 'Approved')
  `;

  sqldb.query(checkSql, [studentId, vehicleType], (err, results) => {
    if (err) return callback(err);
    
    if (results.length > 0) {
      return callback(new Error('Trial exam already exists for this vehicle type'));
    }

    const insertSql = `
      INSERT INTO trial_exams 
      (stu_id, vehicle_type, exam_date, exam_time, status) 
      VALUES (?, ?, ?, ?, 'Pending')
    `;
    
    sqldb.query(insertSql, [studentId, vehicleType, examDate, examTime], (err, result) => {
      if (err) return callback(err);
      callback(null, {
        examId: result.insertId,
        message: 'Trial exam created successfully'
      });
    });
  });
};

export const getTrialExamsByStudent = (studentId, callback) => {
  // Simplified query that doesn't rely on joins that might be causing issues
  const sql = `
    SELECT 
      exam_id, 
      vehicle_type,
      exam_date,
      exam_time,
      status,
      result
    FROM trial_exams
    WHERE stu_id = ?
  `;

  sqldb.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("SQL Error in getTrialExamsByStudent:", err);
      return callback(err);
    }
    callback(null, results);
  });
};

export const updateTrialExamStatus = (examId, status, callback) => {
  const sql = `UPDATE trial_exams SET status = ? WHERE exam_id = ?`;
  
  sqldb.query(sql, [status, examId], (err, result) => {
    if (err) return callback(err);
    
    if (result.affectedRows === 0) {
      return callback(new Error('Trial exam not found'));
    }
    
    callback(null, { 
      message: 'Trial exam status updated successfully' 
    });
  });
};

export const deleteTrialExam = (examId, callback) => {
  const sql = `DELETE FROM trial_exams WHERE exam_id = ?`;
  
  sqldb.query(sql, [examId], (err, result) => {
    if (err) return callback(err);
    
    if (result.affectedRows === 0) {
      return callback(new Error('Trial exam not found'));
    }
    
    callback(null, { 
      message: 'Trial exam deleted successfully' 
    });
  });
};

export const getAllTrialStudents = (callback) => {
  const sql = `
    SELECT 
      te.exam_id,
      te.stu_id,
      s.FIRST_NAME as student_first_name, 
      s.LAST_NAME as student_last_name,
      te.vehicle_type,
      te.exam_date,
      te.exam_time,
      te.status,
      te.result
    FROM trial_exams te
    JOIN student s ON te.stu_id = s.STU_ID
    ORDER BY te.created_at DESC
  `;

  sqldb.query(sql, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Update the updateTrialExam function
export const updateTrialExam = (studentId, vehicleType, updateData, callback) => {
  // Validate result value if it's being updated
  if (updateData.result && !['Pass', 'Fail', 'Not Taken', 'Absent'].includes(updateData.result)) {
    return callback(new Error('Invalid result value'));
  }

  // First find the exam
  const findSql = `
    SELECT * FROM trial_exams 
    WHERE stu_id = ? AND vehicle_type = ?
  `;
  
  sqldb.query(findSql, [studentId, vehicleType], (err, exams) => {
    if (err) return callback(err);
    
    if (exams.length === 0) {
      return callback(new Error('Trial exam not found'));
    }
    
    // Build the update query dynamically
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updateData);
    
    const updateSql = `
      UPDATE trial_exams 
      SET ${updateFields}
      WHERE stu_id = ? AND vehicle_type = ?
    `;
    
    sqldb.query(updateSql, [...updateValues, studentId, vehicleType], (err, result) => {
      if (err) return callback(err);
      callback(null, { affected: result.affectedRows });
    });
  });
};

// New function to update only status and result by exam ID
export const updateTrialExamStatusResult = (examId, updateData, callback) => {
  // Validate result value if it's being updated
  if (updateData.result && !['Pass', 'Fail', 'Not Taken', 'Absent'].includes(updateData.result)) {
    return callback(new Error('Invalid result value'));
  }

  // First check if the exam exists
  const findSql = `SELECT * FROM trial_exams WHERE exam_id = ?`;
  
  sqldb.query(findSql, [examId], (err, exams) => {
    if (err) return callback(err);
    
    if (exams.length === 0) {
      return callback(new Error('Trial exam not found'));
    }
    
    // Build the update query dynamically, but only allow status and result to be updated
    const allowedFields = {};
    if ('status' in updateData) allowedFields.status = updateData.status;
    if ('result' in updateData) allowedFields.result = updateData.result;
    
    const updateFields = Object.keys(allowedFields).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(allowedFields);
    
    if (updateFields.length === 0) {
      return callback(new Error('No valid fields to update'));
    }
    
    const updateSql = `
      UPDATE trial_exams 
      SET ${updateFields}
      WHERE exam_id = ?
    `;
    
    sqldb.query(updateSql, [...updateValues, examId], (err, result) => {
      if (err) return callback(err);
      callback(null, { 
        affected: result.affectedRows,
        exam_id: examId
      });
    });
  });
};