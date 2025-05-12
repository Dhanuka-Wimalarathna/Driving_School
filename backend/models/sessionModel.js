import sqldb from '../config/sqldb.js';

export const getStudentProgressSummary = (studentId, callback) => {
  const query = `
    SELECT 
      CASE 
        WHEN v.type = 'Bike' THEN 1
        WHEN v.type = 'Three-Wheeler' THEN 2
        WHEN v.type = 'Van' THEN 3
      END AS vehicle_id,
      v.type AS vehicle_type,
      CASE 
        WHEN v.type = 'Bike' THEN p.bike_sessions
        WHEN v.type = 'Three-Wheeler' THEN p.tricycle_sessions
        WHEN v.type = 'Van' THEN p.van_sessions
      END AS total_sessions,
      (
        SELECT COUNT(*) 
        FROM completed_sessions cs
        WHERE cs.student_id = ? 
          AND cs.vehicle_type = v.type
      ) AS completed_sessions,
      CASE 
        WHEN v.type = 'Bike' THEN GREATEST(0, p.bike_sessions - (
          SELECT COUNT(*) 
          FROM completed_sessions cs
          WHERE cs.student_id = ? 
            AND cs.vehicle_type = 'Bike'
        ))
        WHEN v.type = 'Three-Wheeler' THEN GREATEST(0, p.tricycle_sessions - (
          SELECT COUNT(*) 
          FROM completed_sessions cs
          WHERE cs.student_id = ? 
            AND cs.vehicle_type = 'Three-Wheeler'
        ))
        WHEN v.type = 'Van' THEN GREATEST(0, p.van_sessions - (
          SELECT COUNT(*) 
          FROM completed_sessions cs
          WHERE cs.student_id = ? 
            AND cs.vehicle_type = 'Van'
        ))
      END AS remaining_sessions
    FROM 
      selected_packages sp
    JOIN 
      packages p ON sp.package_id = p.package_id
    CROSS JOIN 
      (SELECT 'Bike' AS type UNION SELECT 'Three-Wheeler' UNION SELECT 'Van') v
    WHERE 
      sp.student_id = ?
      AND (
        (v.type = 'Bike' AND p.bike_sessions > 0) OR
        (v.type = 'Three-Wheeler' AND p.tricycle_sessions > 0) OR
        (v.type = 'Van' AND p.van_sessions > 0)
      )
  `;

  sqldb.query(query, [studentId, studentId, studentId, studentId, studentId], (err, rows) => {
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

export const markSessionCompleted = (studentId, vehicleType, callback) => {
  sqldb.beginTransaction(err => {
    if (err) return callback(err);
    
    // First check if student has this vehicle type in their package
    sqldb.query(
      `SELECT 
        CASE 
          WHEN ? = 'Bike' THEN bike_sessions
          WHEN ? = 'Three-Wheeler' THEN tricycle_sessions
          WHEN ? = 'Van' THEN van_sessions
        END AS total_sessions
       FROM selected_packages sp
       JOIN packages p ON sp.package_id = p.package_id
       WHERE sp.student_id = ?`,
      [vehicleType, vehicleType, vehicleType, studentId],
      (err, packageResults) => {
        if (err) return sqldb.rollback(() => callback(err));
        if (packageResults.length === 0 || !packageResults[0].total_sessions) {
          return sqldb.rollback(() => callback(new Error(`No ${vehicleType} sessions in package`)));
        }
        
        const totalSessions = packageResults[0].total_sessions;
        
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
                    
                    const vehicleProgress = summary.find(item => item.vehicle_type === vehicleType);
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
  });
};