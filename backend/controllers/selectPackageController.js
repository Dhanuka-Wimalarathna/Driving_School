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

// controllers/selectPackageController.js

export const getSelectedPackage = (req, res) => {
  const studentId = req.userId;

  const query = `
  SELECT 
    p.package_id,
    p.title AS packageName, 
    p.price
  FROM selected_packages sp
  JOIN packages p ON sp.package_id = p.package_id
  WHERE sp.student_id = ?
`;

  sqldb.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching selected package:', err);
      return res.status(500).json({ message: 'Error fetching selected package' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No package selected' });
    }

    return res.status(200).json(results[0]);
  });
};