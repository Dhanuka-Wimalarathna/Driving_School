import {
    getTotalStudents,
    getActiveInstructors,
    fetchPaymentStats
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

  export const getPaymentStats = async (req, res) => {
  try {
    const stats = await fetchPaymentStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ message: 'Failed to retrieve payment stats' });
  }
};
  