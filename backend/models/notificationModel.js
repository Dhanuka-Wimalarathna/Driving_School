import sqldb from "../config/sqldb.js";

export const saveNotification = (studentId, message, callback) => {
  console.log("Saving notification:", studentId, message);
  const query = `
    INSERT INTO notifications (student_id, message)
    VALUES (?, ?)
  `;
  sqldb.query(query, [studentId, message], callback);
};

export const getNotificationsByStudent = (studentId, callback) => {
    const query = "SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC";
    sqldb.query(query, [studentId], callback);
  };
