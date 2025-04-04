import {
    getTotalStudents,
    getActiveInstructors,

  } from "../models/dashboardModel.js";
  
  export const getDashboardStats = async (req, res) => {
    try {
      const totalStudents = await getTotalStudents();
      const activeInstructors = await getActiveInstructors();

      res.status(200).json({
        totalStudents,
        activeInstructors,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  };
  