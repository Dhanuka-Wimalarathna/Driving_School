import { getStudentPayments } from "../models/studentDashboardModel.js";

export const getStudentDashboardData = (req, res) => {
  const studentId = req.userId;

  getStudentPayments(studentId, (err, payments) => {
    if (err) {
      console.error("Dashboard controller error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json({ payments });
  });
};
