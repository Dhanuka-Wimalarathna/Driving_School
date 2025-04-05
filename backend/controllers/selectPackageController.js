import sqldb from '../config/sqldb.js';

// export const selectPackage = (req, res) => {
//   const { studentId, packageId } = req.body;

//   const sql = `INSERT INTO selected_packages (student_id, package_id) VALUES (?, ?)`;

//   sqldb.query(sql, [studentId, packageId], (err, result) => {
//     if (err) {
//       console.error("Error inserting selected package:", err);
//       return res.status(500).json({ error: "Failed to select package" });
//     }
//     res.status(200).json({ message: "Package selected successfully" });
//   });
// };

export const selectPackage = (req, res) => {
  const studentId = req.userId;
  const { packageId } = req.body;

  if (!studentId || !packageId) {
    return res.status(400).json({ message: 'Missing student ID or package ID' });
  }

  sqldb.query(
    'INSERT INTO selected_packages (student_id, package_id) VALUES (?, ?)',
    [studentId, packageId],
    (err, result) => {
      if (err) {
        console.error('Error inserting selected package:', err);
        return res.status(500).json({ message: 'Error selecting package' });
      }

      res.status(200).json({ message: 'Package selected successfully' });
    }
  );
};
