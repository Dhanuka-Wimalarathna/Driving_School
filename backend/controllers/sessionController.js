import sqldb from "../config/sqldb.js";

export const getStudentProgress = async (req, res) => {
  const studentId = req.params.id;

  // 1) Get the latest package_id for this student
  sqldb.query(
    `SELECT package_id 
     FROM selected_packages 
     WHERE student_id = ? 
     ORDER BY selected_at DESC 
     LIMIT 1`,
    [studentId],
    (pkgErr, pkgRows) => {
      if (pkgErr) {
        console.error("DB error fetching selected package:", pkgErr);
        res.status(500).json({ error: "Database error" });
        return;
      }
      if (!pkgRows.length) {
        res.status(404).json({ error: "No package selected for this student" });
        return;
      }

      const packageId = pkgRows[0].package_id;

      // 2) Build summary per vehicle
      const summarySql = `
        SELECT 
          pv.vehicle_id,
          v.name           AS vehicleType,
          pv.lesson_count  AS totalSessions,
          COALESCE(c.completedCount, 0) AS completedSessions,
          pv.lesson_count - COALESCE(c.completedCount,0) AS remainingSessions
        FROM package_vehicles pv
        JOIN vehicles v ON pv.vehicle_id = v.id
        LEFT JOIN (
          SELECT b.vehicle      AS vehicleType,
                 COUNT(*)        AS completedCount
          FROM progress pr
          JOIN bookings b ON pr.booking_id = b.booking_id
          WHERE b.student_id = ?
          GROUP BY b.vehicle
        ) c ON c.vehicleType = v.name
        WHERE pv.package_id = ?
      `;

      sqldb.query(summarySql, [studentId, packageId], (sumErr, summaryRows) => {
        if (sumErr) {
          console.error("DB error building summary:", sumErr);
          res.status(500).json({ error: "Database error" });
          return;
        }

        // 3) Build detail list of completed sessions
        const detailsSql = `
            SELECT 
            pr.progress_id  AS id,
            b.date,
            b.vehicle       AS vehicleType,
            b.time_slot     AS timeSlot,
            pr.completed_at AS completedAt
            FROM progress pr
            LEFT JOIN bookings b ON pr.booking_id = b.booking_id
            WHERE b.student_id = ?
            ORDER BY pr.completed_at DESC
        `;

        sqldb.query(detailsSql, [studentId], (detErr, detailRows) => {
          if (detErr) {
            console.error("DB error fetching details:", detErr);
            res.status(500).json({ error: "Database error" });
            return;
          }

          // 4) Send back both summary and details
          res.json({
            summary: summaryRows,
            details: detailRows,
          });
        });
      });
    }
  );
};
