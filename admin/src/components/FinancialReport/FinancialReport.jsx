import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import Sidebar from '../Sidebar/Sidebar';
import styles from './FinancialReport.module.css';

const FinancialReport = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('full');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [expenses, setExpenses] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [fullPageMode, setFullPageMode] = useState(false);
  const [showReportSection, setShowReportSection] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const generateReport = async (e) => {
    e.preventDefault();
    
    // Validate that both start and end dates are provided
    if (!startDate || !endDate) {
      setError('Please select both start date and end date to generate a report.');
      return;
    }

    setLoading(true);
    setError(null);
    setPdfUrl('');

    try {
      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (reportType) params.append('reportType', reportType);
      if (paymentMethod) params.append('paymentMethod', paymentMethod);
      if (expenses) params.append('expenses', expenses);

      // Get token from local storage
      const token = localStorage.getItem('authToken');
      
      // Request the report
      const response = await axios.get(
        `http://localhost:8081/api/financial-reports/download?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob', // Important for file downloads
        }
      );

      // Create a blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowReportSection(true);
      setFullPageMode(true);
      setReportGenerated(true);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute(
        'download', 
        `financial-report-${new Date().toISOString().split('T')[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const getReportTypeName = () => {
    switch(reportType) {
      case 'full': return 'Full Financial Report';
      case 'summary': return 'Summary Report';
      case 'revenue': return 'Revenue Analysis';
      default: return 'Financial Report';
    }
  };

  const getFormattedDateRange = () => {
    if (startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    } else if (startDate) {
      return `From ${new Date(startDate).toLocaleDateString()}`;
    } else if (endDate) {
      return `Until ${new Date(endDate).toLocaleDateString()}`;
    }
    return 'All time';
  };

  // Clean up the blob URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // If in full page mode, render the full page report
  if (fullPageMode && pdfUrl) {
    return (
      <div className={styles['fullpage-report']}>
        <div className={styles['fullpage-header']}>
          <div className={styles['fullpage-title']}>
            <div className={styles['report-logo']}>FR</div>
            <h2>{getReportTypeName()}</h2>
          </div>
          
          <div className={styles['report-actions']}>
            <span className={styles['report-info']}>
              {getFormattedDateRange()}
              {paymentMethod && ` • ${paymentMethod} payments`}
            </span>
            
            <button 
              className={`${styles['action-button']} ${styles['action-primary']}`}
              onClick={handleDownload}
            >
              Download PDF
            </button>
            
            <button 
              className={`${styles['action-button']} ${styles['action-secondary']}`}
              onClick={() => setFullPageMode(false)}
            >
              Back to Form
            </button>
          </div>
        </div>
        
        <div className={styles['fullpage-content']}>
          <div className={styles['report-viewer']}>
            <iframe 
              src={pdfUrl}
              className={styles['fullpage-iframe']}
              title="Financial Report"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className={styles['report-container']}>
          <div className={styles['page-header']}>
            <h2>Financial Reports</h2>
            {reportGenerated && (
              <Button 
                variant="primary"
                onClick={() => setFullPageMode(true)}
              >
                View Last Report
              </Button>
            )}
          </div>
          
          <div className={styles['form-container']}>
            <div className={styles['card-header']}>
              <h3>Generate Report</h3>
            </div>
            <div className={styles['card-body']}>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={generateReport}>
                <Row className="mb-3">
                  <Col md={6}>
                    <div className={styles['form-group']}>
                      <Form.Label className={styles['form-label']}>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className={styles['form-group']}>
                      <Form.Label className={styles['form-label']}>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <div className={styles['form-group']}>
                      <Form.Label className={styles['form-label']}>Report Type</Form.Label>
                      <Form.Select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option value="full">Full Financial Report</option>
                        <option value="summary">Summary Only</option>
                        <option value="revenue">Revenue Analysis</option>
                      </Form.Select>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className={styles['form-group']}>
                      <Form.Label className={styles['form-label']}>Payment Method (Optional)</Form.Label>
                      <Form.Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="">All Payment Methods</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank Transfer</option>
                      </Form.Select>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <div className={styles['form-group']}>
                      <Form.Label className={styles['form-label']}>Total Expenses happens in Selected Period (LKR)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter total expenses for the selected period"
                        value={expenses}
                        onChange={(e) => setExpenses(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </Col>
                </Row>
                
                <div className={styles['button-container']}>
                  <Button 
                    type="submit"
                    className={styles['generate-button']}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>

          {pdfUrl && showReportSection && !fullPageMode && (
            <div className={styles['report-display']}>
              <div className={styles['report-header']}>
                <h3>Financial Report Preview</h3>
                <div>
                  <Button 
                    variant="primary"
                    className="me-2"
                    onClick={() => setFullPageMode(true)}
                  >
                    Full Screen
                  </Button>
                  <Button 
                    variant="secondary"
                    className="ms-2"
                    onClick={() => setShowReportSection(false)}
                  >
                    Hide Report
                  </Button>
                </div>
              </div>
              <div className={styles['pdf-container']}>
                <iframe 
                  src={pdfUrl}
                  className={styles['pdf-iframe']}
                  title="Financial Report"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FinancialReport; 