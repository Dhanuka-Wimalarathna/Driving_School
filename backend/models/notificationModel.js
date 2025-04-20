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

export const markAllNotificationsAsRead = (studentId, callback) => {
  const query = "UPDATE notifications SET is_read = 1 WHERE student_id = ?";
  sqldb.query(query, [studentId], callback);
};
