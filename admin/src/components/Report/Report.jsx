import React, { useRef } from 'react';
import './Report.css';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Report = ({ stats, monthlyStats, currentMonthRevenue }) => {
  const reportRef = useRef(null);

  const generatePDF = async () => {
    const report = reportRef.current;
    const canvas = await html2canvas(report, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Madushani_Driving_School_Report.pdf');
  };

  // Helper to calculate payment statistics
  const getPaymentStatsByMonth = () => {
    if (!monthlyStats || monthlyStats.length === 0) return [];
    
    return monthlyStats.map(month => ({
      month: month.month,
      revenue: month.total_amount,
      paymentCount: month.payment_count,
      averagePayment: month.payment_count > 0 
        ? (month.total_amount / month.payment_count).toFixed(2) 
        : 0
    }));
  };

  const paymentStatsByMonth = getPaymentStatsByMonth();

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Madushani Driving School - Analytics Report</h1>
      </div>

      <div ref={reportRef} className="report-content">
        <div className="report-school-info">
          <h2>Madushani Driving School</h2>
          <p>Report generated on: {new Date().toLocaleString()}</p>
        </div>

        <div className="report-section">
          <h2>Financial Overview</h2>
          <div className="report-cards">
            <div className="report-card">
              <h4>Total Revenue</h4>
              <p>LKR {stats?.totalRevenue || 0}</p>
            </div>
            <div className="report-card">
              <h4>Monthly Revenue</h4>
              <p>LKR {currentMonthRevenue || 0}</p>
            </div>
            <div className="report-card">
              <h4>Monthly Change</h4>
              <p>{monthlyStats?.length > 1 ? 
                `${Math.round(((currentMonthRevenue - monthlyStats[monthlyStats.length - 2].total_amount) / 
                  monthlyStats[monthlyStats.length - 2].total_amount) * 100)}%` 
                : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2>Student Statistics</h2>
          <div className="report-cards">
            <div className="report-card">
              <h4>Total Students</h4>
              <p>{stats?.totalStudents || 0}</p>
            </div>
            <div className="report-card">
              <h4>Active Instructors</h4>
              <p>{stats?.activeInstructors || 0}</p>
            </div>
          </div>
        </div>

        {monthlyStats?.length > 0 && (
          <div className="report-section">
            <h2>Monthly Revenue Breakdown</h2>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue (LKR)</th>
                  <th>Number of Payments</th>
                  <th>Average Payment (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {paymentStatsByMonth.map((item, index) => (
                  <tr key={index} className={index === paymentStatsByMonth.length - 1 ? 'current-month' : ''}>
                    <td>{item.month}</td>
                    <td>{item.revenue.toLocaleString()}</td>
                    <td>{item.paymentCount}</td>
                    <td>{parseFloat(item.averagePayment).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="report-summary">
                    <div className="summary-text">
                      <strong>Summary:</strong> The school collected a total of LKR {stats?.totalRevenue.toLocaleString() || 0} 
                      across {paymentStatsByMonth.reduce((sum, month) => sum + month.paymentCount, 0)} payments.
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Payment Method Distribution Section */}
        <div className="report-section">
          <h2>Payment Activity Details</h2>
          
          <div className="payment-methods-container">
            <div className="payment-methods-summary">
              <h4>Payment Analysis</h4>
              <p>
                In the most recent month, there were <strong>{paymentStatsByMonth.length > 0 ? 
                paymentStatsByMonth[paymentStatsByMonth.length - 1].paymentCount : 0}</strong> payments made, 
                with an average payment amount of <strong>LKR {paymentStatsByMonth.length > 0 ? 
                parseFloat(paymentStatsByMonth[paymentStatsByMonth.length - 1].averagePayment).toLocaleString() : 0}</strong>.
              </p>
              <p>
                The most active payment period was <strong>{paymentStatsByMonth.length > 0 ? 
                paymentStatsByMonth.reduce((max, month) => 
                  month.paymentCount > max.paymentCount ? month : max
                ).month : 'N/A'}</strong> with <strong>{paymentStatsByMonth.length > 0 ? 
                paymentStatsByMonth.reduce((max, month) => 
                  month.paymentCount > max.paymentCount ? month : max
                ).paymentCount : 0}</strong> payments processed.
              </p>
            </div>
          </div>
        </div>

        <div className="report-footer">
          <p>© 2025 Madushani Driving School. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Report;
