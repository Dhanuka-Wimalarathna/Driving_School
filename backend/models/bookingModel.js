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
  const sql = `
    SELECT 
      booking_id, 
      student_id, 
      vehicle, 
      date, 
      time_slot 
    FROM bookings 
    WHERE instructor_id = ?
    ORDER BY date, time_slot
  `;

  sqldb.query(sql, [instructor_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};
