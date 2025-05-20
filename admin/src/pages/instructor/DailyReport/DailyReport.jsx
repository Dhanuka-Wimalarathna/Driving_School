import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, ArrowLeft, Calendar, User, Car, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import it separately
import InstructorSidebar from '../../../components/Sidebar/InstructorSidebar';
import styles from './DailyReport.module.css';

function DailyReport() {
  const [reportData, setReportData] = useState({
    date: new Date().toLocaleDateString(),
    instructor: {
      name: 'Instructor',
      id: '',
    },
    summary: {
      totalStudents: 0,
      assignedStudents: 0,
      totalSessions: 0,
      completedSessions: 0,
      notCompletedSessions: 0,
      scheduledSessions: 0,
      completionRate: 0,
    },
    sessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = localStorage.getItem('token');
        const instructorId = localStorage.getItem('instructorId');
        
        console.log("localStorage values:", {
          token: token ? "exists" : "missing",
          instructorId
        });
        
        // Fetch dashboard data
        const dashboardResponse = await axios.get('http://localhost:8081/api/instructorDashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Dashboard data:", dashboardResponse.data.data);
        
        const dashboardData = dashboardResponse.data.data;
        const sessionsData = dashboardData.upcomingSessions || [];
        
        // Get instructor details from dashboard response
        const instructorDetails = dashboardData.instructor || {};
        console.log("Instructor details from API:", instructorDetails);
        
        // Create instructor name from the database fields
        // Note: your DB fields are firstName and lastName (camelCase)
        let instructorName = 'Instructor'; // Default name
        if (instructorDetails && (instructorDetails.firstName || instructorDetails.lastName)) {
          instructorName = `${instructorDetails.firstName || ''} ${instructorDetails.lastName || ''}`.trim();
        }
        
        const completedSessions = Number(dashboardData.completedSessions) || 0;
        const notCompletedSessions = Number(dashboardData.notCompletedSessions) || 0;
        const scheduledSessions = Number(dashboardData.scheduledSessions) || 0;
        const totalSessions = completedSessions + notCompletedSessions + scheduledSessions;
        
        const completionRate = totalSessions > 0 
          ? Math.round((completedSessions / totalSessions) * 100) 
          : 0;

        setReportData({
          date: new Date().toLocaleDateString(),
          instructor: {
            name: instructorName,
            email: instructorDetails.email || 'Not available',
            id: instructorDetails.ins_id || instructorId || 'N/A',
            vehicleCategory: instructorDetails.vehicleCategory || 'Not specified'
          },
          summary: {
            totalStudents: Number(dashboardData.totalStudents) || 0,
            assignedStudents: Number(dashboardData.assignedStudents) || 0,
            totalSessions,
            completedSessions,
            notCompletedSessions,
            scheduledSessions,
            completionRate,
          },
          sessions: sessionsData
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load report data:", error);
        setError(error.response?.data?.message || "Failed to load report data");
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleGoBack = () => {
    navigate('/instructor/dashboard');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add the school logo with reduced size
    const logoPath = process.env.PUBLIC_URL + '/images/icon01.jpg';
    
    // Reduce logo size
    let logoWidth = 20; // Reduced from 30mm to 20mm
    let logoHeight = 20; // Reduced from 30mm to 20mm
    
    try {
      // Simply add the image without drawing a circle
      doc.addImage(
        logoPath, 
        'JPEG', 
        20, // X position
        15, // Y position
        logoWidth, 
        logoHeight
      );
    } catch (e) {
      console.error('Error adding image to PDF:', e);
      // Continue without the image if there's an error
    }
    
    // Adjust the school header position
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Madushani Driving School", 105, 20, { align: "center" });
    
    // Add school address and contact info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Bandarawela Motors, Bandarawela, SriLanka", 105, 27, { align: "center" });
    doc.text("Tel: +94 763 608 450 | Email: mds@gmail.com", 105, 32, { align: "center" });
    
    // Add horizontal line separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 37, 190, 37);
    
    // Report title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("Instructor Daily Report", 105, 47, { align: "center" });
    
    // Report info - adjust vertical positions
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${reportData.date}`, 20, 60);
    doc.text(`Instructor: ${reportData.instructor.name}`, 20, 67);
    doc.text(`Email: ${reportData.instructor.email}`, 20, 74);
    doc.text(`ID: ${reportData.instructor.id}`, 20, 81);
    doc.text(`Vehicle Category: ${reportData.instructor.vehicleCategory}`, 20, 88);
    
    // Summary section - adjust vertical positions by adding 25 to original values
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, 103);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Students: ${reportData.summary.totalStudents}`, 30, 113);
    doc.text(`Assigned Students: ${reportData.summary.assignedStudents}`, 30, 120);
    doc.text(`Total Sessions Today: ${reportData.summary.totalSessions}`, 30, 127);
    doc.text(`Completion Rate: ${reportData.summary.completionRate}%`, 30, 134);
    
    // Add sessions breakdown - adjust vertical positions
    doc.text(`Completed: ${reportData.summary.completedSessions}`, 120, 113);
    doc.text(`Not Completed: ${reportData.summary.notCompletedSessions}`, 120, 120);
    
    // Add sessions table - adjust vertical positions
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Today's Sessions", 20, 155);
    
    if (reportData.sessions.length > 0) {
      // Table headers and data
      const tableColumn = ["Student Name", "Time", "Vehicle Type", "Status"];
      const tableRows = reportData.sessions.map(session => [
        `${session.first_name} ${session.last_name}`,
        session.time_slot,
        session.vehicle,
        session.status
      ]);
      
      // Use the imported autoTable function directly with doc as first argument
      autoTable(doc, {
        startY: 160,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          font: 'helvetica',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });
    } else {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.text("No sessions scheduled for today", 20, 160);
    }
    
    // Add border to each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Get page dimensions
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Draw border with 10mm margins
      const margin = 10;
      doc.setLineWidth(0.5);
      doc.rect(
        margin, 
        margin, 
        pageWidth - (margin * 2), 
        pageHeight - (margin * 2)
      );
      
      // Draw decorative corners
      const cornerSize = 5;
      doc.setLineWidth(1);

      // Add footer inside the border
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString()} - Madushani Driving School`,
        105,
        pageHeight - (margin + 5),
        { align: "center" }
      );
    }
    
    // Save the PDF
    doc.save(`Instructor_Daily_Report_${reportData.date.replace(/\//g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <div className={styles['loading-screen']}>
        <div className={styles['spinner']}></div>
        <p>Loading report data...</p>
      </div>
    );
  }

  return (
    <div className={styles['app-layout']}>
      <InstructorSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`${styles['main-content']} ${sidebarCollapsed ? styles['collapsed'] : ''}`}>
        <div className={styles['page-container']}>
          <div className={styles['report-header']}>
            <div className={styles['header-left']}>
              <h1>Daily Report</h1>
              <p className={styles['report-date']}>
                <Calendar size={16} />
                {reportData.date}
              </p>
            </div>
            <button onClick={handleDownloadPDF} className={styles['download-button']}>
              <Download size={16} />
              Download PDF
            </button>
          </div>

          <div className={styles['report-content']}>
            <div className={styles['instructor-info-card']}>
              <h2>Instructor Information</h2>
              <div className={styles['info-grid']}>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>Name:</span>
                  <span className={styles['info-value']}>{reportData.instructor.name}</span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>Email:</span>
                  <span className={styles['info-value']}>{reportData.instructor.email}</span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>ID:</span>
                  <span className={styles['info-value']}>{reportData.instructor.id}</span>
                </div>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>Vehicle Category:</span>
                  <span className={styles['info-value']}>{reportData.instructor.vehicleCategory}</span>
                </div>
              </div>
            </div>

            <div className={styles['summary-section']}>
              <h2>Summary</h2>
              <div className={styles['summary-grid']}>
                {/* First card - Students */}
                <div className={styles['summary-card']}>
                  <div className={styles['summary-icon']}>
                    <User size={20} />
                  </div>
                  <div className={styles['summary-content']}>
                    <h3>Students</h3>
                    <p className={styles['summary-value']}>{reportData.summary.assignedStudents} / {reportData.summary.totalStudents}</p>
                    <p className={styles['summary-label']}>Assigned / Total</p>
                  </div>
                </div>
                
                {/* Second card - Sessions Today */}
                <div className={styles['summary-card']}>
                  <div className={styles['summary-icon']}>
                    <Calendar size={20} />
                  </div>
                  <div className={styles['summary-content']}>
                    <h3>Sessions Today</h3>
                    <p className={styles['summary-value']}>{reportData.summary.totalSessions}</p>
                    <p className={styles['summary-label']}>Total Sessions</p>
                  </div>
                </div>
                
                {/* Third card - Completion Rate */}
                <div className={styles['summary-card']}>
                  <div className={styles['summary-icon']}>
                    <Clock size={20} />
                  </div>
                  <div className={styles['summary-content']}>
                    <h3>Completion Rate</h3>
                    <p className={styles['summary-value']}>{reportData.summary.completionRate}%</p>
                    <p className={styles['summary-label']}>Of Today's Sessions</p>
                  </div>
                </div>
              </div>

              <div className={styles['sessions-breakdown']}>
                <div className={`${styles['breakdown-item']} ${styles['completed']}`}>
                  <span className={styles['breakdown-label']}>Completed:</span>
                  <span className={styles['breakdown-value']}>{reportData.summary.completedSessions}</span>
                </div>
                <div className={`${styles['breakdown-item']} ${styles['not-completed']}`}>
                  <span className={styles['breakdown-label']}>Not Completed:</span>
                  <span className={styles['breakdown-value']}>{reportData.summary.notCompletedSessions}</span>
                </div>
              </div>
            </div>

            <div className={styles['sessions-section']}>
              <h2>Today's Sessions</h2>
              <div className={styles['sessions-table-container']}>
                {reportData.sessions.length === 0 ? (
                  <div className={styles['no-sessions']}>
                    <p>No sessions scheduled for today</p>
                  </div>
                ) : (
                  <table className={styles['sessions-table']}>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Time</th>
                        <th>Vehicle Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.sessions.map((session, index) => (
                        <tr key={index}>
                          <td className={styles['student-name']}>
                            {session.first_name} {session.last_name}
                          </td>
                          <td>{session.time_slot}</td>
                          <td className={styles['vehicle-type']}>
                            <Car size={14} />
                            <span>{session.vehicle}</span>
                          </td>
                          <td>
                            <span className={`${styles['status-badge']} ${styles[session.status.toLowerCase().replace(' ', '-')]}`}>
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DailyReport;