import sqldb from '../config/sqldb.js';
import { insertBooking, checkSlotAvailability, checkStudentVehicleCategoryBooking, getScheduleByInstructorId } from '../models/bookingModel.js';

export const createBooking = (req, res) => {
  const studentId = req.userId;
  const { date, vehicle_slots } = req.body;

  if (!studentId || !date || !Array.isArray(vehicle_slots) || vehicle_slots.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid booking data' });
  }

  const formattedDate = new Date(date).toISOString().split('T')[0];

  // Check if the selected date is a Sunday
  const selectedDate = new Date(date);
  if (selectedDate.getDay() === 0) { // 0 represents Sunday
    return res.status(400).json({ message: 'Bookings are not available on Sundays' });
  }

  // First, check if the student already has bookings for any of the requested vehicle categories on the same date
  const categoryChecks = vehicle_slots.map(({ vehicle }) => {
    return new Promise((resolve, reject) => {
      checkStudentVehicleCategoryBooking(studentId, formattedDate, vehicle, (err, hasBooking) => {
        if (err) return reject(err);
        if (hasBooking) {
          return reject(new Error(`You already have a ${vehicle} session booked for this date`));
        }
        resolve();
      });
    });
  });

  // Then proceed with availability checks
  Promise.all(categoryChecks)
    .then(() => {
      // Check if all requested slots are available
      const availabilityChecks = vehicle_slots.map(({ vehicle, time_slot, instructor_id }) => {
        return new Promise((resolve, reject) => {
          checkSlotAvailability(formattedDate, time_slot, vehicle, instructor_id, (err, isAvailable) => {
            if (err) return reject(err);
            if (!isAvailable) {
              return reject(new Error(`Slot not available for ${vehicle} at ${time_slot}`));
            }
            resolve();
          });
        });
      });

      return Promise.all(availabilityChecks);
    })
    .then(() => {
      // All slots available, proceed with booking
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
              res.status(500).json({ message: 'Booking failed', error: error.message });
            });
          });
      });
    })
    .catch(error => {
      res.status(400).json({ message: error.message });
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

  sqldb.query(
    'SELECT 1 FROM instructors WHERE ins_id = ? LIMIT 1', 
    [instructorId],
    (err, results) => {
      if (err) {
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

      getScheduleByInstructorId(instructorId, (err, results) => {
        if (err) {
          return res.status(500).json({
            message: 'Database error fetching schedule',
            error: err.message
          });
        }
        
        res.status(200).json(results);
      });
    }
  );
};

export const getStudentBookings = (req, res) => {
  const studentId = req.userId;

  const sql = `
    SELECT 
      b.booking_id AS id,
      b.date,
      b.time_slot AS time,
      b.vehicle AS vehicle_type,
      b.status,
      CONCAT(i.firstName, ' ', i.lastName) AS instructor_name
    FROM bookings b
    JOIN instructors i ON b.instructor_id = i.ins_id
    WHERE b.student_id = ?
    ORDER BY b.date, b.time_slot
  `;

  sqldb.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching student bookings:', err);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    res.status(200).json(results);
  });
};

// Get student bookings for a specific date
export const getStudentBookingsByDate = (req, res) => {
  const studentId = req.userId;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date parameter is required' });
  }

  const sql = `
    SELECT 
      b.booking_id AS id,
      b.date,
      b.time_slot AS time_slot,
      b.vehicle,
      b.status,
      b.instructor_id,
      CONCAT(i.firstName, ' ', i.lastName) AS instructor_name
    FROM bookings b
    JOIN instructors i ON b.instructor_id = i.ins_id
    WHERE b.student_id = ? AND b.date = ?
    ORDER BY b.time_slot
  `;

  sqldb.query(sql, [studentId, date], (err, results) => {
    if (err) {
      console.error('Error fetching student bookings by date:', err);
      return res.status(500).json({ error: 'Failed to fetch bookings for the specified date' });
    }

    res.status(200).json(results);
  });
};
