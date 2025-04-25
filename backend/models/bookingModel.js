import sqldb from "../config/sqldb.js";

export const insertBooking = (studentId, vehicle, date, timeSlot, instructorId, callback) => {
  const sql = `INSERT INTO bookings (student_id, vehicle, date, time_slot, instructor_id) VALUES (?, ?, ?, ?, ?)`;
  sqldb.query(sql, [studentId, vehicle, date, timeSlot, instructorId], (err, result) => {
    if (err) {
      console.error('Error inserting booking:', err);
    }
    callback(err, result);
  });
};

export const checkSlotAvailability = (date, timeSlot, vehicle, instructorId, callback) => {
  const sql = `
    SELECT 1 FROM bookings 
    WHERE date = ? 
    AND time_slot = ? 
    AND (vehicle = ? OR instructor_id = ?)
    LIMIT 1
  `;
  
  sqldb.query(sql, [date, timeSlot, vehicle, instructorId], (err, results) => {
    if (err) {
      console.error('Error checking slot availability:', err);
      return callback(err);
    }
    callback(null, results.length === 0);
  });
};

export const getScheduleByInstructorId = (instructorId, callback) => {
  const sql = `
    SELECT 
      b.booking_id AS id,
      b.date,
      b.time_slot AS timeSlot,
      b.vehicle,
      CONCAT(s.FIRST_NAME, ' ', s.LAST_NAME) AS studentName,
      CASE WHEN b.student_id IS NOT NULL THEN 'Booked' ELSE 'Available' END AS status
    FROM bookings b
    LEFT JOIN student s ON b.student_id = s.STU_ID
    WHERE b.instructor_id = ?
    ORDER BY b.date, b.time_slot
  `;

  sqldb.query(sql, [instructorId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return callback(err);
    }
    callback(null, results);
  });
};