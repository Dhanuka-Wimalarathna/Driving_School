import sqldb from '../config/sqldb.js';

export const markSessionAsCompleted = (bookingId, callback) => {
    // First, get the session details from the bookings table with student name
    const getBookingDetailsQuery = `
    SELECT 
      bookings.student_id,
      CONCAT(student.FIRST_NAME, ' ', student.LAST_NAME) AS student_name,
      bookings.vehicle, 
      bookings.time_slot
    FROM bookings
    JOIN student ON bookings.student_id = student.STU_ID
    WHERE bookings.booking_id = ?
    `;
  
    sqldb.query(getBookingDetailsQuery, [bookingId], (err, result) => {
        if (err) {
          console.error('Error fetching booking:', err);
          return callback(err);
        }
        if (result.length === 0) {
          console.log('No booking found with ID:', bookingId);
          return callback(new Error('Booking not found.'));
        }
        console.log('Booking found:', result[0]);
  
        const { student_id, student_name, vehicle, time_slot } = result[0];
        const status = 'Completed';
  
        // Insert session completion record into progress table
        const insertQuery = `
          INSERT INTO progress (
            booking_id,
            student_id,
            student_name, 
            vehicle, 
            time_slot, 
            status, 
            completed_at
          )
          VALUES (?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            student_name = VALUES(student_name),
            vehicle = VALUES(vehicle),
            time_slot = VALUES(time_slot),
            status = VALUES(status),
            completed_at = NOW()
        `;
  
        sqldb.query(insertQuery, [bookingId, student_id, student_name, vehicle, time_slot, status], (insertErr, insertResult) => {
          if (insertErr) return callback(insertErr);
  
          // Update the booking status instead of deleting it
          const updateQuery = `UPDATE bookings SET status = ? WHERE booking_id = ?`;
          sqldb.query(updateQuery, [status, bookingId], (updateErr) => {
            if (updateErr) return callback(updateErr);
  
            // Update student progress if applicable
            updateStudentProgress(student_id, vehicle, (progressErr) => {
              if (progressErr) {
                console.error('Warning: Failed to update student progress:', progressErr);
                // Continue with success response even if progress update fails
              }
              
              return callback(null, { message: 'Session marked as completed and progress recorded.' });
            });
          });
        });
    });
};

// Helper function to update student_progress table
const updateStudentProgress = (studentId, vehicleType, callback) => {
  // First, get the vehicle ID based on the vehicle type
  const getVehicleIdQuery = `
    SELECT id FROM vehicles WHERE type = ? OR name = ? LIMIT 1
  `;
  
  sqldb.query(getVehicleIdQuery, [vehicleType, vehicleType], (err, vehicleResults) => {
    if (err || vehicleResults.length === 0) {
      // If vehicle not found, just skip the progress update
      return callback(null);
    }
    
    const vehicleId = vehicleResults[0].id;
    
    // Check if the student already has a progress record for this vehicle
    const checkProgressQuery = `
      SELECT id, completed_sessions, total_sessions 
      FROM student_progress 
      WHERE student_id = ? AND vehicle_id = ?
    `;
    
    sqldb.query(checkProgressQuery, [studentId, vehicleId], (err, progressResults) => {
      if (err) return callback(err);
      
      if (progressResults.length > 0) {
        // Update existing progress record
        const progressId = progressResults[0].id;
        const completedSessions = progressResults[0].completed_sessions + 1;
        const totalSessions = progressResults[0].total_sessions;
        
        const updateProgressQuery = `
          UPDATE student_progress 
          SET completed_sessions = ? 
          WHERE id = ?
        `;
        
        sqldb.query(updateProgressQuery, [completedSessions, progressId], callback);
      } else {
        // Get total sessions from package_vehicles if available
        const getTotalSessionsQuery = `
          SELECT pv.lesson_count
          FROM selected_packages sp
          JOIN package_vehicles pv ON sp.package_id = pv.package_id
          JOIN vehicles v ON pv.vehicle_id = v.id
          WHERE sp.student_id = ? AND v.id = ?
          ORDER BY sp.selected_at DESC
          LIMIT 1
        `;
        
        sqldb.query(getTotalSessionsQuery, [studentId, vehicleId], (err, packageResults) => {
          const totalSessions = (packageResults && packageResults.length > 0) ? 
            packageResults[0].lesson_count : 0;
          
          // Create new progress record
          const insertProgressQuery = `
            INSERT INTO student_progress (
              student_id, 
              vehicle_id, 
              completed_sessions, 
              total_sessions
            ) VALUES (?, ?, 1, ?)
          `;
          
          sqldb.query(insertProgressQuery, [studentId, vehicleId, totalSessions], callback);
        });
      }
    });
  });
};