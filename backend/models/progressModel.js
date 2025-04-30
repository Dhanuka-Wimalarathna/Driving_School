import sqldb from '../config/sqldb.js';

export const markSessionAsCompleted = (bookingId, callback) => {
    // First, get the session details from the bookings table with student name
    const getBookingDetailsQuery = `
    SELECT 
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
        const status = 'Scheduled';
  
      const { student_name, vehicle, time_slot } = result[0];
  
      // Insert session completion record into progress table
      const insertQuery = `
        INSERT INTO progress (
          booking_id, 
          student_name, 
          vehicle, 
          time_slot, 
          status, 
          completed_at
        )
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
  
      sqldb.query(insertQuery, [bookingId, student_name, vehicle, time_slot, status], (insertErr, insertResult) => {
        if (insertErr) return callback(insertErr);
  
        // After inserting into progress, delete the booking from bookings table
        const deleteQuery = `DELETE FROM bookings WHERE booking_id = ?`;
        sqldb.query(deleteQuery, [bookingId], (deleteErr) => {
          if (deleteErr) return callback(deleteErr);
  
          return callback(null, { message: 'Session marked as completed.' });
        });
      });
    });
  };