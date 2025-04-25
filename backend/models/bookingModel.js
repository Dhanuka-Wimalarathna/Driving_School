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

  console.log('Executing query:', sql.replace(/\s+/g, ' ').trim());
  console.log('With instructorId:', instructorId);

  sqldb.query(sql, [instructorId], (err, results) => {
    if (err) {
      console.error('Database error:', {
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
        sql: err.sql
      });
      return callback(err);
    }
    console.log(`Found ${results.length} schedule items`);
    callback(null, results);
  });
};