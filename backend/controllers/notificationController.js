import { saveNotification, getNotificationsByStudent, markAllNotificationsAsRead, } from "../models/notificationModel.js";

export const sendNotifications = async (req, res) => {
  const { studentIds, message } = req.body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !message) {
    return res.status(400).json({ error: "studentIds and message are required" });
  }

  try {
    const sendAll = studentIds.map((id) => {
      return new Promise((resolve, reject) => {
        saveNotification(id, message, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    await Promise.all(sendAll);

    return res.status(200).json({ message: "Notifications sent successfully" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return res.status(500).json({ error: "Failed to send notifications" });
  }
};

// Notification Controller to fetch notifications by student ID
export const getNotifications = (req, res) => {
  const studentId = req.userId; 
  
  console.log("Fetching notifications for student:", studentId); // Log the student ID to ensure it's correct
  
  // Fetch notifications from the database based on student ID
  getNotificationsByStudent(studentId, (err, result) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
    
    console.log("Notifications retrieved:", result); // Log the retrieved notifications
    
    // Send the result back to the client
    return res.json(result);  // Send notifications to the client
  });
};

export const markAllAsRead = (req, res) => {
  const studentId = req.userId; // Get student ID from auth middleware

  markAllNotificationsAsRead(studentId, (err, result) => {
    if (err) {
      console.error("Error marking all as read:", err);
      return res.status(500).json({ error: "Failed to mark all notifications as read" });
    }

    return res.status(200).json({ message: "All notifications marked as read" });
  });
};

