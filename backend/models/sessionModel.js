import sqldb from '../config/sqldb.js';

export const getStudentProgressSummary = (studentId, callback) => {
  const query = `
    SELECT 
      v.id AS vehicle_id,
      v.type AS vehicle_type,
      pv.lesson_count AS total_sessions,
      (
        SELECT COUNT(*) 
        FROM completed_sessions cs
        JOIN vehicles v2 ON cs.vehicle_type = v2.type
        WHERE cs.student_id = ? 
          AND v2.id = v.id
      ) AS completed_sessions,
      GREATEST(0, pv.lesson_count - (
        SELECT COUNT(*) 
        FROM completed_sessions cs
        JOIN vehicles v2 ON cs.vehicle_type = v2.type
        WHERE cs.student_id = ? 
          AND v2.id = v.id
      )) AS remaining_sessions
    FROM 
      selected_packages sp
    JOIN 
      package_vehicles pv ON sp.package_id = pv.package_id
    JOIN 
      vehicles v ON pv.vehicle_id = v.id
    WHERE 
      sp.student_id = ?
  `;

  sqldb.query(query, [studentId, studentId, studentId], (err, rows) => {
    if (err) return callback(err);
    
    const result = rows.map(row => ({
      vehicle_id: row.vehicle_id,
      vehicle_type: row.vehicle_type,
      totalSessions: row.total_sessions,
      completedSessions: row.completed_sessions,
      remainingSessions: row.remaining_sessions
    }));
    
    callback(null, result);
  });
};

export const markSessionCompleted = (studentId, vehicleId, callback) => {
  sqldb.beginTransaction(err => {
    if (err) return callback(err);
    
    // First get vehicle type
    sqldb.query(
      'SELECT type FROM vehicles WHERE id = ?',
      [vehicleId],
      (err, vehicleResults) => {
        if (err) return sqldb.rollback(() => callback(err));
        if (vehicleResults.length === 0) {
          return sqldb.rollback(() => callback(new Error('Vehicle not found')));
        }
        
        const vehicleType = vehicleResults[0].type;
        
        // Check current progress
        sqldb.query(
          `SELECT pv.lesson_count AS total
           FROM selected_packages sp
           JOIN package_vehicles pv ON sp.package_id = pv.package_id
           WHERE sp.student_id = ? AND pv.vehicle_id = ?`,
          [studentId, vehicleId],
          (err, packageResults) => {
            if (err) return sqldb.rollback(() => callback(err));
            if (packageResults.length === 0) {
              return sqldb.rollback(() => callback(new Error('Package not found')));
            }
            
            const totalSessions = packageResults[0].total;
            
            // Count completed sessions
            sqldb.query(
              `SELECT COUNT(*) AS completed
               FROM completed_sessions
               WHERE student_id = ? AND vehicle_type = ?`,
              [studentId, vehicleType],
              (err, countResults) => {
                if (err) return sqldb.rollback(() => callback(err));
                
                const completed = countResults[0].completed;
                
                if (completed >= totalSessions) {
                  return sqldb.rollback(() => callback(new Error('All sessions already completed')));
                }
                
                // Insert new completed session
                sqldb.query(
                  'INSERT INTO completed_sessions (student_id, vehicle_type) VALUES (?, ?)',
                  [studentId, vehicleType],
                  (err, insertResult) => {
                    if (err) return sqldb.rollback(() => callback(err));
                    
                    // Get updated summary
                    getStudentProgressSummary(studentId, (err, summary) => {
                      if (err) return sqldb.rollback(() => callback(err));
                      
                      sqldb.commit(err => {
                        if (err) return sqldb.rollback(() => callback(err));
                        
                        const vehicleProgress = summary.find(item => item.vehicle_id == vehicleId);
                        const allCompleted = vehicleProgress.completedSessions >= vehicleProgress.totalSessions;
                        
                        callback(null, {
                          summary,
                          vehicleProgress,
                          allCompleted
                        });
                      });
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};