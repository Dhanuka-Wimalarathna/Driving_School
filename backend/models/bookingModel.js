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
