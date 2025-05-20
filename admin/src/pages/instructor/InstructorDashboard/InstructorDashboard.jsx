import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// Change this import to use your CSS modules properly
import styles from './InstructorDashboard.module.css';
import InstructorSidebar from '../../../components/Sidebar/InstructorSidebar';
import { Users, Calendar, LogOut, Car, Clock, Book, FileText } from 'lucide-react'; 

ChartJS.register(ArcElement, Tooltip, Legend);

function InstructorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    assignedStudents: 0,
    scheduledSessions: 0,
    completedSessions: 0,
    notCompletedSessions: 0,
    upcomingSessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/instructor/sign-in');
  };
  
  // Handle daily report generation
  const handleDailyReport = () => {
    // You can navigate to a report page or open a modal
    navigate('/instructor/daily-report');
    // Alternatively, you can implement a function to generate and download a report
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8081/api/instructorDashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({
          ...response.data.data,
          scheduledSessions: Number(response.data.data.scheduledSessions) || 0,
          completedSessions: Number(response.data.data.completedSessions) || 0,
          notCompletedSessions: Number(response.data.data.notCompletedSessions) || 0
        });
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Calculate completion percentage for additional insights
  const completionPercentage = stats.scheduledSessions + stats.completedSessions + stats.notCompletedSessions > 0
    ? Math.round((stats.completedSessions / (stats.scheduledSessions + stats.completedSessions + stats.notCompletedSessions)) * 100)
    : 0;

  // Pie chart data configuration for today's sessions
  const pieChartData = {
    labels: ['Scheduled', 'Completed', 'Not Completed'],
    datasets: [
      {
        data: [stats.scheduledSessions, stats.completedSessions, stats.notCompletedSessions],
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b'],
        hoverBackgroundColor: ['#4338ca', '#059669', '#d97706'],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: "Poppins, sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        padding: 12,
        bodyFont: {
          family: "Poppins, sans-serif",
          size: 13
        },
        titleFont: {
          family: "Poppins, sans-serif",
          size: 14,
          weight: '600'
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) return (
    <div className={styles['loading-screen']}>
      <div className={styles['spinner']}></div>
      <p>Loading dashboard data...</p>
    </div>
  );
  
  if (error) return (
    <div className={styles['error-screen']}>
      <h2>Error</h2>
      <p>{error}</p>
    </div>
  );

  return (
    // Update these class names to use the styles object
    <div className={styles['app-layout']}>
      <InstructorSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`${styles['main-content']} ${sidebarCollapsed ? styles['collapsed'] : ''}`}>
        <div className={styles['page-container']}>
          <div className={styles['dashboard-content']}>
            <div className={styles['page-header']}>
              <h1>Instructor Dashboard</h1>
              <button 
                className={styles['report-button']} 
                onClick={handleDailyReport}
              >
                <FileText size={16} />
                <span>Daily Report</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className={styles['stats-grid']}>
              <div className={styles['stat-card']}>
                <div className={`${styles['stat-icon-wrapper']} ${styles.primary}`}>
                  <Users size={22} />
                </div>
                <div className={styles['stat-content']}>
                  <h3 className={styles['stat-title']}>Total Students</h3>
                  <p className={styles['stat-value']}>{stats.totalStudents}</p> 
                  {/* <p className={styles['stat-change']}>In the system</p> */}
                </div>
              </div>

              <div className={styles['stat-card']}>
                <div className={`${styles['stat-icon-wrapper']} ${styles.success}`}>
                  <Book size={22} />
                </div>
                <div className={styles['stat-content']}>
                  <h3 className={styles['stat-title']}>Your Students</h3>
                  <p className={styles['stat-value']}>{stats.assignedStudents}</p>
                  {/* <p className={styles['stat-change']}>Assigned to you</p> */}
                </div>
              </div>

              <div className={styles['stat-card']}>
                <div className={`${styles['stat-icon-wrapper']} ${styles.info}`}>
                  <Calendar size={22} />
                </div>
                <div className={styles['stat-content']}>
                  <h3 className={styles['stat-title']}>Today's Sessions</h3>
                  <p className={styles['stat-value']}>{stats.scheduledSessions + stats.completedSessions + stats.notCompletedSessions}</p>
                  {/* <p className={styles['stat-change']}>
                    <span className={styles.positive}>{stats.completedSessions} completed</span>, 
                    <span className={styles.warning}>{stats.notCompletedSessions} not completed</span>, 
                    {stats.scheduledSessions} upcoming
                  </p> */}
                </div>
              </div>

              <div className={styles['stat-card']}>
                <div className={`${styles['stat-icon-wrapper']} ${styles.warning}`}>
                  <Clock size={22} />
                </div>
                <div className={styles['stat-content']}>
                  <h3 className={styles['stat-title']}>Completion Rate</h3>
                  <p className={styles['stat-value']}>{completionPercentage}%</p>
                  {/* <p className={`${styles['stat-change']} ${styles.positive}`}>
                    Today's progress
                  </p> */}
                </div>
              </div>
            </div>

            {/* Charts and Sessions Section */}
            <div className={styles['charts-container']}>
              <div className={styles['charts-row']}>
                <div className={styles['chart-section']}>
                  <div className={styles['section-header']}>
                    <h2>Today's Session Status</h2>
                  </div>
                  <div className={styles['chart-container']}>
                    {stats.scheduledSessions === 0 && stats.completedSessions === 0 ? (
                      <div className={styles['no-sessions-chart']}>No sessions today</div>
                    ) : (
                      <Pie data={pieChartData} options={pieChartOptions} height={300} />
                    )}
                  </div>
                </div>

                <div className={styles['session-list-section']}>
                  <div className={styles['section-header']}>
                    <h2>Today's Sessions ({new Date().toLocaleDateString()})</h2>
                  </div>
                  <div className={styles['sessions-container']}>
                    {stats.upcomingSessions.length === 0 ? (
                      <div className={styles['no-data']}>
                        <p>No sessions scheduled for today</p>
                      </div>
                    ) : (
                      <div className={styles['sessions-grid']}>
                        {stats.upcomingSessions.slice(0, 6).map(session => (
                          <div key={session.booking_id} className={styles['session-card']}>
                            <div className={styles['session-header']}>
                              <span className={styles['student-names']}>
                                {session.first_name} {session.last_name}
                              </span>
                              <span className={styles['session-time']}>{session.time_slot}</span>
                            </div>
                            <div className={styles['session-details']}>
                              <span className={styles['session-vehicle']}>
                                <Car size={14} />
                                {session.vehicle}
                              </span>
                              <span className={`${styles['session-status']} ${styles[session.status.toLowerCase()]}`}>
                                {session.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboard;