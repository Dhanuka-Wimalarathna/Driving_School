import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import {   getRevenueData,   getRevenueByPackage,   getPaymentMethodDistribution} from '../models/financialReportModel.js';

// Create the __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use __dirname
const logoPath = path.join(__dirname, '../assets/images/icon01.jpg');

export const generateFinancialReport = async (req, res) => {
  try {
    // Check admin privileges
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // Extract date range and filters from request
    const { 
      startDate, 
      endDate, 
      packageId, 
      paymentMethod, 
      reportType = 'full' // "full", "revenue", "summary"
    } = req.query;
    
    // Validate dates if provided
    if ((startDate && !isValidDate(startDate)) || (endDate && !isValidDate(endDate))) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    
    // Fetch data
    const filters = { packageId, paymentMethod };
    const revenueData = await getRevenueData(startDate, endDate, filters);
    const packageRevenue = await getRevenueByPackage(startDate, endDate);
    const paymentMethods = await getPaymentMethodDistribution(startDate, endDate);
    
    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      autoFirstPage: true,
      bufferPages: true // Enable page buffering
    });
    
    // Set up page counter
    let pageNumber = 1;
    
    // Function to add footer to current page
    const addFooter = () => {
      const bottom = doc.page.height - 50;
      
      // Draw footer line
      doc.moveTo(50, bottom)
         .lineTo(doc.page.width - 50, bottom)
         .stroke('#e5e7eb');
      
      // Add footer text
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor('#6b7280')
         .text(
            `Madushani Driving School - Financial Report`, 
            50, 
            bottom - 20
         )
         .text(
            `Page ${pageNumber}`, 
            doc.page.width - 50, 
            bottom - 20, 
            { align: 'right' }
         );
    };
    
    // Setup the page event handler
    doc.on('pageAdded', () => {
      pageNumber++;
      addFooter();
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Add footer to the first page
    addFooter();
    
    // Generate appropriate report based on type
    if (reportType === 'full' || reportType === 'summary') {
      await generateSummaryReport(doc, revenueData, startDate, endDate);
    }
    
    if (reportType === 'full' || reportType === 'revenue') {
      if (reportType !== 'summary') {
        await generateRevenueReport(doc, revenueData, packageRevenue, paymentMethods);
      }
    }
    
    // Finalize the document
    doc.end();
    
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
};

// Helper function to validate date format
const isValidDate = (dateString) => {
  return !isNaN(Date.parse(dateString));
};

// Function to generate summary report with revenue details on first page
const generateSummaryReport = async (doc, revenueData, startDate, endDate) => {
  try {
    // Define footer margin to avoid overlapping with page numbers
    const footerMargin = 40;
    
    // Setup the header area
    doc.rect(50, 50, 495, 100)
       .fillColor('#f8fafc')
       .fill();
    
    // Add the logo to the header
    doc.image(logoPath, 60, 60, { 
      width: 70,
      height: 70 
    });
    
    // Add title and report name next to the logo
    doc.fillColor('#111827')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('Madushani Driving School', 145, 70);
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Financial Summary Report', 145, 100);
    
    // Add date range below header section
    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';
    
    doc.fontSize(12)
       .text(`Report Period: ${dateRange}`, 50, 170, { align: 'center' });
    
    // Add a decorative line to separate header from content
    doc.moveTo(100, 190).lineTo(495, 190).lineWidth(1).stroke('#4f46e5');
    
    // Format currency function
    const formatCurrency = (amount) => `Rs. ${parseFloat(amount || 0).toFixed(2)}`;
    
    // Calculate total revenue
    const totalRevenue = revenueData.reduce((total, month) => total + parseFloat(month.total_revenue || 0), 0);
    
    // Add total revenue highlight box
    doc.rect(150, 240, 230, 100)
       .fillColor('#f0f9ff')
       .fill();
    
    doc.rect(150, 240, 230, 30)
       .fillColor('#0284c7')
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('TOTAL REVENUE', 165, 250);
    
    doc.fillColor('#0284c7')
       .fontSize(24)
       .text(formatCurrency(totalRevenue), 165, 285);
    
    // Add monthly revenue section
    doc.fillColor('#111827')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Monthly Revenue Trends', 50, 370);
    
    // Create table for monthly revenue
    if (revenueData && revenueData.length > 0) {
      const tableTop = 400;
      const rowHeight = 30;
      
      // Table header
      doc.rect(50, tableTop, 495, rowHeight)
         .fillColor('#f8fafc')
         .fill();
      
      doc.fillColor('#111827')
         .fontSize(12)
         .font('Helvetica-Bold');
      
      doc.text('Month', 70, tableTop + 20);
      doc.text('Revenue', 190, tableTop + 20);
      doc.text('Transactions', 320, tableTop + 20);
      doc.text('Avg. Transaction', 440, tableTop + 20);
      
      // Table rows
      revenueData.slice(-6).forEach((month, i) => {
        const y = tableTop + rowHeight + (i * rowHeight);
        
        // Check if we need a new page
        if (y > doc.page.height - footerMargin - rowHeight) {
          doc.addPage();
          return;
        }
        
        // Alternating row colors
        if (i % 2 === 0) {
          doc.rect(50, y, 495, rowHeight)
             .fillColor('#f9fafb')
             .fill();
        }
        
        // Format date
        const monthDate = new Date(month.month + '-01');
        const formattedMonth = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        // Print row data
        doc.fillColor('#374151')
           .fontSize(11)
           .font('Helvetica');
        
        doc.text(formattedMonth, 70, y + 20);
        doc.text(formatCurrency(month.total_revenue), 190, y + 20);
        doc.text(month.transaction_count.toString(), 320, y + 20);
        doc.text(formatCurrency(month.average_transaction), 440, y + 20);
      });
    }
    
  } catch (error) {
    console.error('Error in generateSummaryReport:', error);
    throw error;
  }
};

// Function to generate revenue report section
const generateRevenueReport = (doc, revenueData, packageRevenue, paymentMethods) => {
  // Define footer margin to avoid overlapping with page numbers
  const footerMargin = 40;
  
  doc.addPage();
  
  try {
    // Setup the header area on the new page
    doc.rect(50, 50, 495, 100)
       .fillColor('#f8fafc')
       .fill();
    
    // Add the logo to the header
    doc.image(logoPath, 60, 60, { 
      width: 70,
      height: 70 
    });
    
    // Add title and report name next to the logo
    doc.fillColor('#111827')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('Madushani Driving School', 145, 70);
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Revenue Analysis', 145, 100);
  } catch (error) {
    console.error('Error adding logo to revenue report page:', error);
    // Fallback without logo
    doc.fontSize(18).text('Revenue Analysis', { align: 'center' });
  }
  
  doc.moveDown(1);
  
  // Monthly Revenue Breakdown
  doc.fontSize(14).text('Monthly Revenue Breakdown', { underline: true });
  doc.moveDown(0.5);
  
  // Create a table for monthly revenue
  if (revenueData.length > 0) {
    // Table headers
    const tableTop = doc.y + 10;
    doc.fontSize(10);
    doc.text('Month', 50, tableTop);
    doc.text('Revenue', 200, tableTop);
    doc.text('# Transactions', 300, tableTop);
    doc.text('Avg Transaction', 400, tableTop);
    
    doc.moveDown(0.5);
    
    // Table rows
    revenueData.forEach((month, i) => {
      const y = tableTop + 20 + (i * 20);
      
      // Check if we're approaching the footer area
      if (y > doc.page.height - footerMargin - 20) {
        doc.addPage();
        doc.fontSize(14).text('Monthly Revenue (Continued)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        const newTableTop = doc.y + 10;
        doc.text('Month', 50, newTableTop);
        doc.text('Revenue', 200, newTableTop);
        doc.text('# Transactions', 300, newTableTop);
        doc.text('Avg Transaction', 400, newTableTop);
        doc.moveDown(0.5);
        // Reset position counter for new page
        i = -1; // Will become 0 after increment
        return;
      }
      
      // Format date from YYYY-MM to MMM YYYY
      const monthDate = new Date(month.month + '-01');
      const formattedMonth = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      doc.text(formattedMonth, 50, y);
      doc.text(`Rs. ${parseFloat(month.total_revenue).toFixed(2)}`, 200, y);
      doc.text(month.transaction_count.toString(), 300, y);
      doc.text(`Rs. ${parseFloat(month.average_transaction).toFixed(2)}`, 400, y);
    });
  } else {
    doc.text('No revenue data available for the selected period.', { italics: true });
  }
  
  doc.moveDown(2);
  
  // Check if we're close to the bottom
  if (doc.y > doc.page.height - footerMargin - 100) {
    doc.addPage();
  }
  
  // Revenue by Package
  doc.fontSize(14).text('Revenue by Package', { underline: true });
  doc.moveDown(0.5);
  
  if (packageRevenue.length > 0) {
    // Table headers
    const tableTop = doc.y + 10;
    doc.fontSize(10);
    doc.text('Package', 50, tableTop);
    doc.text('Sales', 200, tableTop);
    doc.text('Revenue', 250, tableTop);
    doc.text('Avg Sale', 350, tableTop);
    
    doc.moveDown(0.5);
    
    // Table rows
    packageRevenue.forEach((pkg, i) => {
      const y = tableTop + 20 + (i * 20);
      
      // Check if we're approaching the footer area
      if (y > doc.page.height - footerMargin - 20) {
        doc.addPage();
        doc.fontSize(14).text('Revenue by Package (Continued)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        const newTableTop = doc.y + 10;
        doc.text('Package', 50, newTableTop);
        doc.text('Sales', 200, newTableTop);
        doc.text('Revenue', 250, newTableTop);
        doc.text('Avg Sale', 350, newTableTop);
        doc.moveDown(0.5);
        // Reset position counter for new page
        i = -1; // Will become 0 after increment
        return;
      }
      
      doc.text(pkg.package_name, 50, y);
      doc.text(pkg.total_sales.toString(), 200, y);
      doc.text(`Rs. ${parseFloat(pkg.revenue).toFixed(2)}`, 250, y);
      doc.text(`Rs. ${parseFloat(pkg.average_sale).toFixed(2)}`, 350, y);
    });
  } else {
    doc.text('No package revenue data available.', { italics: true });
  }
  
  doc.moveDown(2);
  
  // Check if we're close to the bottom
  if (doc.y > doc.page.height - footerMargin - 100) {
    doc.addPage();
  }
  
  // Payment Methods Breakdown
  doc.fontSize(14).text('Payment Method Distribution', { underline: true });
  doc.moveDown(0.5);
  
  if (paymentMethods.length > 0) {
    // Table headers
    const tableTop = doc.y + 10;
    doc.fontSize(10);
    doc.text('Payment Method', 50, tableTop);
    doc.text('Transactions', 200, tableTop);
    doc.text('Amount', 300, tableTop);
    doc.text('% of Revenue', 400, tableTop);
    
    doc.moveDown(0.5);
    
    // Table rows
    paymentMethods.forEach((method, i) => {
      const y = tableTop + 20 + (i * 20);
      
      // Check if we're approaching the footer area
      if (y > doc.page.height - footerMargin - 20) {
        doc.addPage();
        doc.fontSize(14).text('Payment Method Distribution (Continued)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        const newTableTop = doc.y + 10;
        doc.text('Payment Method', 50, newTableTop);
        doc.text('Transactions', 200, newTableTop);
        doc.text('Amount', 300, newTableTop);
        doc.text('% of Revenue', 400, newTableTop);
        doc.moveDown(0.5);
        // Reset position counter for new page
        i = -1; // Will become 0 after increment
        return;
      }
      
      doc.text(method.payment_method || 'Unknown', 50, y);
      doc.text(method.transaction_count.toString(), 200, y);
      doc.text(`Rs. ${parseFloat(method.total_amount).toFixed(2)}`, 300, y);
      doc.text(`${parseFloat(method.percentage).toFixed(2)}%`, 400, y);
    });
  } else {
    doc.text('No payment method data available.', { italics: true });
  }
  
  doc.moveDown(2);
}; 