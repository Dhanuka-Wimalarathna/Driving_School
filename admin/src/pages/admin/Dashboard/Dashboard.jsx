import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { BookOpen, Users, Calendar, DollarSign, LogOut, Settings, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './Dashboard.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInstructors: 0,
    upcomingExams: 0,
    totalRevenue: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef(null);
  const [showTrialExamStudents, setShowTrialExamStudents] = useState(false);
  const [trialExamStudents, setTrialExamStudents] = useState([]);
  const [loadingTrialStudents, setLoadingTrialStudents] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSettings = () => {
    navigate('/admin/financial-reports');
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const report = reportRef.current;
      const canvas = await html2canvas(report, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Madushani_Driving_School_Report.pdf');
      
      // Hide report after download
      setShowReport(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchMonthlyStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/dashboard/payment-stats");
      setMonthlyStats(response.data.monthlyStats || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      setLoading(false);
    }
  };

  // Add this function to handle trial exam students button click
  const handleTrialExamStudents = () => {
    navigate('/trial-exam-students');
  };

  // Revenue Chart Data
  const revenueChartData = {
    labels: monthlyStats.map(item => item.month),
    datasets: [
      {
        label: '  Monthly Revenue (LKR)',
        data: monthlyStats.map(item => item.total_amount),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Payments Count Chart Data
  const paymentsChartData = {
    labels: monthlyStats.map(item => item.month),
    datasets: [
      {
        label: '  Number of Payments',
        data: monthlyStats.map(item => item.payment_count),
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: "Poppins, sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: false
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
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 1)',
          borderDash: [5, 5]
        },
        ticks: {
          font: {
            family: "Poppins, sans-serif",
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "Poppins, sans-serif",
            size: 11
          }
        }
      }
    }
  };

  // Calculate current month revenue
  const currentMonthRevenue = monthlyStats.length > 0 
    ? monthlyStats[monthlyStats.length - 1].total_amount 
    : 0;

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="page-container">
          <div className={styles['dashboard-content']}>
            <div className={styles['page-header']}>
              <h1>Admin Dashboard</h1>
              <div className={styles['header-actions']}>
                <button className={styles['trial-exam-btn']} onClick={handleTrialExamStudents}>
                  <Calendar size={20} className={styles['trial-exam-icon']} />
                  Trial Exam Students
                </button>
                <button onClick={handleSettings} className={styles['download-btn']}>
                  <Download size={20} className={styles['download-icon']} />
                  Financial Report
                </button>
              </div>
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
                  <p className={`${styles['stat-change']} ${styles.positive}`}>+3.2% from last month</p>
                </div>
              </div>

              <div className={styles['stat-card']}>
                <div className={`${styles['stat-icon-wrapper']} ${styles.success}`}>
                  <BookOpen size={22} />
                </div>
                <div className={styles['stat-content']}>
                  <h3 className={styles['stat-title']}>Active Instructors</h3>
                  <p className={styles['stat-value']}>{stats.activeInstructors}</p>
                  <p className={`${styles['stat-change']} ${styles.positive}`}>+2.1% from last month</p>
                </div>
              </div>

              <div className={styles['stat-card']}>
                <div className={`${styles['stat-icon-wrapper']} ${styles.info}`}>
                  <DollarSign size={22} />
                </div>
                <div className={styles['stat-content']}>
                  <h3 className={styles['stat-title']}>Total Revenue</h3>
                  <p className={styles['stat-value']}>LKR {stats.totalRevenue}</p>
                  <p className={`${styles['stat-change']} ${styles.positive}`}>+4.7% from last month</p>
                </div>
              </div>

              <div className={styles['stat-card']}>
                <div className={`${styles['stat-icon-wrapper']} ${styles.warning}`}>
                  <DollarSign size={22} />
                </div>
                <div className={styles['stat-content']}>
                  <h3 className={styles['stat-title']}>This Month's Revenue</h3>
                  <p className={styles['stat-value']}>LKR {currentMonthRevenue}</p>
                  <p className={`${styles['stat-change']} ${styles.positive}`}>
                    {monthlyStats.length > 1 ? 
                      `+${Math.round(((currentMonthRevenue - monthlyStats[monthlyStats.length - 2].total_amount) / 
                        monthlyStats[monthlyStats.length - 2].total_amount) * 100)}% from last month` 
                      : 'No previous data'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Charts Section */}
            <div className={styles['charts-container']}>
              {loading ? (
                <div className={styles['loading-spinner']}>
                  <div className={styles.spinner}></div>
                  <p>Loading payment data...</p>
                </div>
              ) : monthlyStats.length > 0 ? (
                <div className={styles['charts-row']}>
                  <div className={styles['chart-section']}>
                    <div className={styles['section-header']}>
                      <h2>Monthly Revenue Breakdown</h2>
                    </div>
                    <div className={styles['chart-container']}>
                      <Bar data={revenueChartData} options={chartOptions} height={350} />
                    </div>
                  </div>
                  
                  <div className={styles['chart-section']}>
                    <div className={styles['section-header']}>
                      <h2>Monthly Payment Activity</h2>
                    </div>
                    <div className={styles['chart-container']}>
                      <Bar data={paymentsChartData} options={chartOptions} height={350} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles['no-data']}>
                  <p>No payment data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;