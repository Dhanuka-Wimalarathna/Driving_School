import sqldb from "../config/sqldb.js";

export const getStudentPayments = (studentId, callback) => {
  const sql = "SELECT * FROM payments WHERE student_id = ?";
  sqldb.query(sql, [studentId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};
