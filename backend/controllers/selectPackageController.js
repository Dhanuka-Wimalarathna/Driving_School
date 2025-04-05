import sqldb from '../config/sqldb.js';

export const selectPackage = (req, res) => {
  const studentId = req.userId;
  const { packageId } = req.body;

  if (!studentId || !packageId) {
    return res.status(400).json({ message: 'Missing student ID or package ID' });
  }

  // Step 1: Check if the student already selected a package
  const checkQuery = 'SELECT * FROM selected_packages WHERE student_id = ?';

  sqldb.query(checkQuery, [studentId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking existing package selection:', checkErr);
      return res.status(500).json({ message: 'Error checking package selection' });
    }

    if (checkResults.length > 0) {
      // Student has already selected a package
      return res.status(400).json({ message: 'You have already selected a package' });
    }

    // Step 2: Insert the selected package
    const insertQuery = 'INSERT INTO selected_packages (student_id, package_id) VALUES (?, ?)';
    sqldb.query(insertQuery, [studentId, packageId], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting selected package:', insertErr);
        return res.status(500).json({ message: 'Error selecting package' });
      }

      return res.status(200).json({ message: 'Package selected successfully' });
    });
  });
};
