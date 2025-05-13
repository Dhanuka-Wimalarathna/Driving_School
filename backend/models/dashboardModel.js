import sqldb from "../config/sqldb.js";

export const getTotalStudents = () => {
  return new Promise((resolve, reject) => {
   sqldb.query("SELECT COUNT(*) AS totalStudents FROM student", (err, result) => {
      if (err) return reject(err);
      resolve(result[0].totalStudents);
    });
  });
};

export const getActiveInstructors = () => {
  return new Promise((resolve, reject) => {
    sqldb.query("SELECT COUNT(*) AS activeInstructors FROM instructors", (err, result) => {
      if (err) return reject(err);
      resolve(result[0].activeInstructors);
    });
  });
};

export const getTotalRevenue = () => {
  return new Promise((resolve, reject) => {
    sqldb.query(
      "SELECT SUM(amount) AS totalRevenue FROM payments WHERE status = 'paid'", 
      (err, result) => {
        if (err) return reject(err);
        resolve(result[0].totalRevenue || 0);
      }
    );
  });
};

export const fetchPaymentStats = () => {
  return new Promise((resolve, reject) => {
    const summarySql = `
      SELECT
        COUNT(*) AS total_transactions,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS total_revenue,
        COUNT(DISTINCT CASE WHEN status = 'paid' THEN student_id ELSE NULL END) AS paid_students
      FROM payments
    `;

    const monthlySql = `
      SELECT 
        DATE_FORMAT(transaction_date, '%b') AS month,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS total_amount,
        COUNT(*) AS payment_count
      FROM payments
      WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY MONTH(transaction_date), DATE_FORMAT(transaction_date, '%b')
      ORDER BY MONTH(transaction_date)
    `;

    sqldb.query(summarySql, (err, summaryResults) => {
      if (err) return reject(err);

      sqldb.query(monthlySql, (err, monthlyResults) => {
        if (err) return reject(err);

        resolve({
          ...summaryResults[0],
          monthlyStats: monthlyResults
        });
      });
    });
  });
};

