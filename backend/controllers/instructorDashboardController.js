import { getInstructorStats } from '../models/instructorDashboardModel.js';

export async function getDashboardData(req, res) {
  try {
    const instructorId = req.userId;
    
    if (!instructorId) {
      throw new Error('Instructor ID not found');
    }

    const stats = await getInstructorStats(instructorId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
}