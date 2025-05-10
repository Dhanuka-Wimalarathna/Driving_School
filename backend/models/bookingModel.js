import sqldb from '../config/sqldb.js';

// Check if a booking already exists for the same date, time, vehicle, and instructor
export const checkSlotAvailability = (date, time_slot, vehicle, instructor_id, callback) => {
  const sql = `
    SELECT COUNT(*) AS count 
    FROM bookings 
    WHERE date = ? 
      AND time_slot = ? 
      AND vehicle = ? 
      AND instructor_id = ?
  `;

  sqldb.query(sql, [date, time_slot, vehicle, instructor_id], (err, results) => {
    if (err) return callback(err);

    const isAvailable = results[0].count === 0;
    callback(null, isAvailable);
  });
};

// Insert a new booking
export const insertBooking = (student_id, vehicle, date, time_slot, instructor_id, callback) => {
  const sql = `
    INSERT INTO bookings (student_id, vehicle, date, time_slot, instructor_id) 
    VALUES (?, ?, ?, ?, ?)
  `;

  sqldb.query(sql, [student_id, vehicle, date, time_slot, instructor_id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Get the full schedule of an instructor (all their bookings)
export const getScheduleByInstructorId = (instructor_id, callback) => {
  // Using DATE_FORMAT to ensure consistent date output without time component
  const sql = `
    SELECT 
      b.booking_id, 
      DATE_FORMAT(b.date, '%Y-%m-%d') AS date,
      b.time_slot,
      b.vehicle,
      b.status,
      s.STU_ID AS student_id,
      CONCAT(s.FIRST_NAME, ' ', s.LAST_NAME) AS studentName
    FROM bookings b
    JOIN student s ON b.student_id = s.STU_ID
    WHERE b.instructor_id = ?
    ORDER BY b.date, b.time_slot
  `;

  sqldb.query(sql, [instructor_id], (err, results) => {
    if (err) return callback(err);
    
    // Ensure dates are properly formatted strings before sending to frontend
    const formattedResults = results.map(item => ({
      ...item,
      // Ensure date is in YYYY-MM-DD format
      date: item.date.toString().split('T')[0],
      // Ensure status exists
      status: item.status || 'Scheduled'
    }));
    
    callback(null, formattedResults);
  });
};
