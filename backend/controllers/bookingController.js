import sqldb from '../config/sqldb.js';
import { insertBooking, getScheduleByInstructorId } from '../models/bookingModel.js';

export const createBooking = (req, res) => {
  const studentId = req.userId;
  const { date, vehicle_slots } = req.body;

  if (!studentId || !date || !Array.isArray(vehicle_slots) || vehicle_slots.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid booking data' });
  }

  const formattedDate = new Date(date).toISOString().split('T')[0];

  sqldb.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ message: 'Error starting transaction', error: err });
    }

    const queries = vehicle_slots.map(({ vehicle, time_slot, instructor_id }) => {
      return new Promise((resolve, reject) => {
        insertBooking(studentId, vehicle, formattedDate, time_slot, instructor_id, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    });

    Promise.all(queries)
      .then(() => {
        sqldb.commit(err => {
          if (err) {
            return sqldb.rollback(() => {
              res.status(500).json({ message: 'Error committing transaction', error: err });
            });
          }
          res.status(200).json({ message: 'Booking successful' });
        });
      })
      .catch(error => {
        sqldb.rollback(() => {
          res.status(500).json({ message: 'Booking failed', error });
        });
      });
  });
};

export const getInstructorSchedule = (req, res) => {
  const instructorId = parseInt(req.params.instructorId);
  
  if (!instructorId || instructorId <= 0) {
    return res.status(400).json({
      message: 'Invalid instructor ID',
      details: `Received: ${req.params.instructorId}`
    });
  }

  // First verify instructor exists
  sqldb.query(
    'SELECT 1 FROM instructors WHERE ins_id = ? LIMIT 1', 
    [instructorId],
    (err, results) => {
      if (err) {
        console.error('Instructor verification failed:', err);
        return res.status(500).json({
          message: 'Error verifying instructor',
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          message: 'Instructor not found'
        });
      }

      // Now fetch the schedule
      getScheduleByInstructorId(instructorId, (err, results) => {
        if (err) {
          console.error('Schedule fetch error:', err);
          return res.status(500).json({
            message: 'Database error fetching schedule',
            error: err.sqlMessage || err.message
          });
        }
        
        res.status(200).json(results);
      });
    }
  );
};