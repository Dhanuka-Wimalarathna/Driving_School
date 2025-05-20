import sqldb from '../config/sqldb.js';

export async function getInstructorStats(instructorId) {
  try {
    // Get instructor details - ADD THIS NEW QUERY
    const [instructorResult] = await sqldb.promise().query(
      `SELECT 
         ins_id, 
         firstName, 
         lastName, 
         email, 
         phone,
         vehicleCategory
       FROM instructors
       WHERE ins_id = ?`,
      [instructorId]
    );

    // Get total students in system
    const [totalResult] = await sqldb.promise().query(
      `SELECT COUNT(*) as totalStudents FROM student`
    );

    // Get students assigned to this instructor
    const [assignedResult] = await sqldb.promise().query(
      `SELECT COUNT(DISTINCT s.stu_id) as assignedStudents
       FROM student s
       JOIN bookings b ON s.stu_id = b.student_id
       WHERE b.instructor_id = ?`,
      [instructorId]
    );

    // Get today's scheduled sessions count for this instructor
    const [scheduledResult] = await sqldb.promise().query(
      `SELECT COUNT(*) as scheduledSessions
       FROM bookings
       WHERE instructor_id = ? 
       AND status = 'Scheduled'
       AND date = CURDATE()`,
      [instructorId]
    );

    // Get today's completed sessions count for this instructor
    const [completedResult] = await sqldb.promise().query(
      `SELECT COUNT(*) as completedSessions
       FROM bookings
       WHERE instructor_id = ? 
       AND status = 'Completed'
       AND date = CURDATE()`,
      [instructorId]
    );

    // Get today's not completed sessions count for this instructor
    const [notCompletedResult] = await sqldb.promise().query(
      `SELECT COUNT(*) as notCompletedSessions
       FROM bookings
       WHERE instructor_id = ? 
       AND status = 'Not Completed'
       AND date = CURDATE()`,
      [instructorId]
    );

    // Get upcoming sessions (today's scheduled sessions)
    const [sessions] = await sqldb.promise().query(
      `SELECT 
        b.booking_id,
        s.first_name,
        s.last_name,
        b.date,
        b.time_slot,
        b.vehicle,
        b.status
       FROM bookings b
       JOIN student s ON b.student_id = s.stu_id
       WHERE b.instructor_id = ? 
       AND b.date = CURDATE()
       ORDER BY b.time_slot`,
      [instructorId]
    );

    return {
      // Include instructor details in the response
      instructor: instructorResult[0] || null,
      totalStudents: totalResult[0].totalStudents,
      assignedStudents: assignedResult[0].assignedStudents || 0,
      scheduledSessions: scheduledResult[0].scheduledSessions || 0,
      completedSessions: completedResult[0].completedSessions || 0,
      notCompletedSessions: notCompletedResult[0].notCompletedSessions || 0,
      upcomingSessions: sessions
    };

  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}