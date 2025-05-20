import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import {   
  getRevenueData,   
  getRevenueByPackage,   
  getPaymentMethodDistribution,
  getPaymentTransactions
} from '../models/financialReportModel.js';

// Create the __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use __dirname
const logoPath = path.join(__dirname, '../assets/images/icon01.jpg');

// Format currency function for use throughout the file
const formatCurrency = (amount) => `Rs. ${parseFloat(amount || 0).toFixed(2)}`;

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
      reportType = 'full', // "full", "revenue", "summary"
      expenses = '0' // Add expenses parameter with default value
    } = req.query;
    
    // Validate that both start and end dates are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Both start date and end date are required to generate a report.' });
    }
    
    // Validate dates if provided
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    
    // Fetch data
    const filters = { packageId, paymentMethod };
    const revenueData = await getRevenueData(startDate, endDate, filters);
    const packageRevenue = await getRevenueByPackage(startDate, endDate);
    const paymentMethods = await getPaymentMethodDistribution(startDate, endDate);
    const paymentTransactions = await getPaymentTransactions(startDate, endDate, filters);
    
    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      autoFirstPage: true,
      bufferPages: true
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
            bottom - 15,
            { align: 'left' }
         )
         .text(
            `Page ${pageNumber}`, 
            doc.page.width - 100, 
            bottom - 15, 
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
      await generateSummaryReport(doc, revenueData, startDate, endDate, expenses);
    }
    
    if (reportType === 'full' || reportType === 'revenue') {
      if (reportType !== 'summary') {
        await generateRevenueReport(doc, revenueData, packageRevenue, paymentMethods, expenses, startDate, endDate);
      }
    }
    
    // Add detailed payment transactions page for full reports
    if (reportType === 'full' && paymentTransactions.length > 0) {
      doc.addPage();
      generatePaymentTransactionsPage(doc, paymentTransactions, startDate, endDate);
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
const generateSummaryReport = async (doc, revenueData, startDate, endDate, expenses) => {
  try {
    // Define footer margin to avoid overlapping with page numbers
    const footerMargin = 20;
    
    // Setup the header area
    doc.rect(50, 50, 500, 80)
       .fillColor('#f8fafc')
       .fill();
    
    // Add the logo to the header
    function addCircularImageWithBorder(doc, imagePath, x, y, size, borderWidth = 2, borderColor = '#000000') {
      const centerX = x + size/2;
      const centerY = y + size/2;
      const radius = size/2;
      
      // Save graphics state
      doc.save();
      
      // Create circular clipping path
      doc.circle(centerX, centerY, radius)
         .clip();
      
      // Draw the image
      doc.image(imagePath, x, y, { 
        width: size,
        height: size 
      });
      
      // Restore graphics state
      doc.restore();
      
      // Add border if specified
      if (borderWidth > 0) {
        doc.circle(centerX, centerY, radius)
           .lineWidth(borderWidth)
           .strokeColor(borderColor)
           .stroke();
      }
    }
    
    // Usage:
    addCircularImageWithBorder(doc, logoPath, 60, 60, 70, 3, '#333333');
    
    // Add title and report name next to the logo
    doc.fillColor('#111827')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('Madushani Driving School', 175, 70);
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Financial Summary Report', 210, 100);
    
    // Add address and contact info
    doc.fontSize(10)
       .fillColor('#4b5563')
       .text('Bandarawela motors, Bandarawela, Sri Lanka', 50, 120, { align: 'center' })
       .text('Tel: +94 76 360 8450', 50, 135, { align: 'center' });
    
    // Add date range below header section
    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';
    
    doc.fontSize(12)
       .text(`Report Period: ${dateRange}`, 50, 150, { align: 'center' });
    
    // Add a decorative line to separate header from content
    doc.moveTo(100, 175).lineTo(495, 175).lineWidth(1).stroke('#4f46e5');
    
    // Calculate total revenue
    const totalRevenue = parseFloat(revenueData.totalAllRevenue || 0);
    const totalExpenses = parseFloat(expenses || 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // Add total revenue and expenses highlight box - made wider and with better spacing
    doc.rect(120, 240, 350, 180)
       .fillColor('#f0f9ff')
       .fill();
    
    doc.rect(120, 200, 350, 40)
       .fillColor('#0284c7')
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('FINANCIAL SUMMARY', 120, 215, { align: 'center', width: 350 });
    
    // Improved font sizes and spacing
    doc.fillColor('#111827') // Darker text color for better contrast
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Total Revenue:', 150, 260)
       .fontSize(16)
       .text(formatCurrency(totalRevenue), 320, 260);
    
    doc.fillColor('#111827')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Total Expenses:', 150, 300)
       .fontSize(16)
       .text(formatCurrency(totalExpenses), 320, 300);
    
    doc.fillColor('#111827')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Net Profit:', 150, 340)
       .fontSize(16);
    
    // Conditionally color the profit/loss
    if (netProfit >= 0) {
      doc.fillColor('#047857'); // Green for profit
    } else {
      doc.fillColor('#dc2626'); // Red for loss
    }
    doc.text(formatCurrency(netProfit), 320, 340);
    
    // Add profit margin
    doc.fillColor('#111827')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Profit Margin:', 150, 380);
    
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // Conditionally color the margin
    if (profitMargin >= 0) {
      doc.fillColor('#047857'); // Green for positive
    } else {
      doc.fillColor('#dc2626'); // Red for negative
    }
    doc.fontSize(16)
       .text(`${profitMargin.toFixed(2)}%`, 320, 380);
    
    // Add monthly revenue section - increased Y position from 430 to 470 to add more space
    doc.fillColor('#111827')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('Monthly Revenue Trends', 50, 470);
    
    // Create table for monthly revenue - adjusted table position from 460 to 500
    if (revenueData.monthlyData && revenueData.monthlyData.length > 0) {
      const tableTop = 500;
      const rowHeight = 35; // Increased row height
      
      // Table header with better styling
      doc.rect(50, tableTop, 495, rowHeight)
         .fillColor('#1e40af') // Darker blue for header
         .fill();
      
      doc.fillColor('#ffffff') // White text for better contrast on dark background
         .fontSize(12)
         .font('Helvetica-Bold');
      
      doc.text('Month', 70, tableTop + 12);
      doc.text('Transactions', 220, tableTop + 12);
      doc.text('Revenue', 400, tableTop + 12);

      
      // Table rows
      revenueData.monthlyData.slice(-6).forEach((month, i) => {
        const y = tableTop + rowHeight + (i * rowHeight);
        
        // Check if we need a new page
        if (y > doc.page.height - footerMargin - rowHeight) {
          doc.addPage();
          
          // Add header to new page
          doc.fillColor('#111827')
             .fontSize(22)
             .font('Helvetica-Bold')
             .text('Madushani Driving School', 175, 70);
             
          doc.fontSize(16)
             .font('Helvetica')
             .text('Monthly Revenue Trends (Continued)', 210, 100);
          
          // Add address and contact info
          doc.fontSize(10)
             .fillColor('#4b5563')
             .text('Bandarawela motors, Bandarawela, Sri Lanka', 50, 120, { align: 'center' })
             .text('Tel: +94 76 360 8450', 50, 135, { align: 'center' });
          
          // Add report period to continued page
          doc.fontSize(12)
             .text(`Report Period: ${dateRange}`, 50, 150, { align: 'center' });
          
          // Add decorative line
          doc.moveTo(100, 175).lineTo(495, 175).lineWidth(1).stroke('#4f46e5');
          
          // Recreate the table header on new page
          const newTableTop = 200;
          doc.rect(50, newTableTop, 495, rowHeight)
             .fillColor('#1e40af')
             .fill();
          
          doc.fillColor('#ffffff')
             .fontSize(12)
             .font('Helvetica-Bold');
          
          doc.text('Month', 70, newTableTop + 12);
          doc.text('Transactions', 220, newTableTop + 12);
          doc.text('Revenue', 400, newTableTop + 12);
          
          return;
        }
        
        // Alternating row colors with more contrast
        if (i % 2 === 0) {
          doc.rect(50, y, 495, rowHeight)
             .fillColor('#f0f9ff') // Light blue for even rows
             .fill();
        } else {
          doc.rect(50, y, 495, rowHeight)
             .fillColor('#ffffff') // White for odd rows
             .fill();
        }
        
        // Format date with better display
        let formattedMonth;
        try {
        const monthDate = new Date(month.month + '-01');
          formattedMonth = month.month_name && month.year 
            ? `${month.month_name} ${month.year}`
            : monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        } catch (e) {
          formattedMonth = month.month || 'Unknown';
        }
        
        // Print row data with improved positioning
        doc.fillColor('#374151')
           .fontSize(11)
           .font('Helvetica');
        
        doc.text(formattedMonth, 70, y + 12);
        doc.text(month.transaction_count.toString(), 250, y + 12);
        doc.text(formatCurrency(month.total_revenue), 400, y + 12);

      });
    }
    
  } catch (error) {
    console.error('Error in generateSummaryReport:', error);
    throw error;
  }
};

// Function to generate revenue report section
const generateRevenueReport = (doc, revenueData, packageRevenue, paymentMethods, expenses, startDate, endDate) => {
  // Define footer margin to avoid overlapping with page numbers
  const footerMargin = 40;
  
  doc.addPage();
  
  try {
    // Setup the header area on the new page with consistent style
    doc.rect(50, 50, 500, 80)
       .fillColor('#f8fafc')
       .fill();
    
    // Add the logo to the header
    function addCircularImageWithBorder(doc, imagePath, x, y, size, borderWidth = 2, borderColor = '#000000') {
      const centerX = x + size/2;
      const centerY = y + size/2;
      const radius = size/2;
      
      // Save graphics state
      doc.save();
      
      // Create circular clipping path
      doc.circle(centerX, centerY, radius)
         .clip();
      
      // Draw the image
      doc.image(imagePath, x, y, { 
        width: size,
        height: size 
      });
      
      // Restore graphics state
      doc.restore();
      
      // Add border if specified
      if (borderWidth > 0) {
        doc.circle(centerX, centerY, radius)
           .lineWidth(borderWidth)
           .strokeColor(borderColor)
           .stroke();
      }
    }
    
    // Usage:
    addCircularImageWithBorder(doc, logoPath, 60, 60, 70, 3, '#333333');
    
    // Add title and report name next to the logo
    doc.fillColor('#111827')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('Madushani Driving School', 175, 70);
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Revenue Analysis', 240, 100);
    
    // Add address and contact info
    doc.fontSize(10)
       .fillColor('#4b5563')
       .text('Bandarawela motors, Bandarawela, Sri Lanka', 50, 120, { align: 'center' })
       .text('Tel: +94 76 360 8450', 50, 135, { align: 'center' });
    
    // Add date range
    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';
    
    doc.fontSize(12)
       .text(`Report Period: ${dateRange}`, 50, 150, { align: 'center' });
    
    // Add a decorative line to separate header from content
    doc.moveTo(100, 175).lineTo(495, 175).lineWidth(1).stroke('#4f46e5');
    
    doc.moveDown(4);
  
  // Monthly Revenue Breakdown
  doc.fontSize(14).text('Monthly Revenue Breakdown', { underline: true });
  doc.moveDown(0.5);
  
  // Create a table for monthly revenue
    if (revenueData.monthlyData && revenueData.monthlyData.length > 0) {
    // Table headers
    const tableTop = doc.y + 10;
    doc.fontSize(10);
    doc.text('Month', 50, tableTop);
    doc.text('Revenue', 200, tableTop);
    doc.text('# Transactions', 300, tableTop);
    
    doc.moveDown(0.5);
    
    // Table rows
      revenueData.monthlyData.forEach((month, i) => {
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
        doc.moveDown(0.5);
        // Reset position counter for new page
        i = -1; // Will become 0 after increment
        return;
      }
      
      // Format date from YYYY-MM to MMM YYYY
      const monthDate = new Date(month.month + '-01');
      const formattedMonth = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      doc.text(formattedMonth, 50, y);
        doc.text(formatCurrency(month.total_revenue), 200, y);
      doc.text(month.transaction_count.toString(), 300, y);
    });
  } else {
    doc.text('No revenue data available for the selected period.', { italics: true });
  }
  
  doc.moveDown(2);
  
  // Check if we're close to the bottom
  if (doc.y > doc.page.height - footerMargin - 100) {
    doc.addPage();
  }
  
    // Revenue by Package - updated to match "Monthly Revenue Trends" style
    doc.fillColor('#111827')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('Revenue by Package', 50, doc.y + 20);
    doc.moveDown(1);
  
  if (packageRevenue.length > 0) {
      // Table headers with better styling
    const tableTop = doc.y + 10;
      doc.rect(50, tableTop, 495, 30)
         .fillColor('#1e40af')
         .fill();
         
      doc.fontSize(12)
         .fillColor('#ffffff')
         .font('Helvetica-Bold');
      doc.text('Package', 70, tableTop + 10);
      doc.text('Sales', 280, tableTop + 10);
      doc.text('Revenue', 400, tableTop + 10);
    
    doc.moveDown(0.5);
    
      // Table rows with improved styling
    packageRevenue.forEach((pkg, i) => {
        const y = tableTop + 40 + (i * 30);
      
      // Check if we're approaching the footer area
        if (y > doc.page.height - footerMargin - 30) {
        doc.addPage();
          
          // Updated continued header to match consistent style
          doc.fillColor('#111827')
             .fontSize(18)
             .font('Helvetica-Bold')
             .text('Revenue by Package (Continued)', 50, 50);
          doc.moveDown(1);
          
          // Add address and contact info
          doc.fontSize(10)
             .fillColor('#4b5563')
             .text('Bandarawela motors, Bandarawela, Sri Lanka', 50, 80, { align: 'center' })
             .text('Tel: +94 76 360 8450', 50, 95, { align: 'center' });
          
          // Recreate header on new page
          const newTableTop = doc.y;
          doc.rect(50, newTableTop, 495, 30)
             .fillColor('#1e40af')
             .fill();
           
          doc.fontSize(12)
             .fillColor('#ffffff')
             .font('Helvetica-Bold');
          doc.text('Package', 70, newTableTop + 10);
          doc.text('Sales', 280, newTableTop + 10);
          doc.text('Revenue', 400, newTableTop + 10);
          
        doc.moveDown(0.5);
        // Reset position counter for new page
        i = -1; // Will become 0 after increment
        return;
      }
      
        // Alternating row colors
        if (i % 2 === 0) {
          doc.rect(50, y - 5, 495, 30)
             .fillColor('#f0f9ff')
             .fill();
        } else {
          doc.rect(50, y - 5, 495, 30)
             .fillColor('#ffffff')
             .fill();
        }
        
        // Format package name to prevent overflow
        const packageName = pkg.package_name.length > 25 
          ? pkg.package_name.substring(0, 22) + '...'
          : pkg.package_name;
        
        doc.fontSize(11)
           .fillColor('#374151')
           .font('Helvetica');
        doc.text(packageName, 70, y);
        doc.text(pkg.total_sales.toString(), 280, y);
        doc.text(formatCurrency(pkg.revenue), 400, y);
    });
  } else {
    doc.text('No package revenue data available.', { italics: true });
  }
  
  doc.moveDown(2);
  
  // Check if we're close to the bottom
  if (doc.y > doc.page.height - footerMargin - 100) {
    doc.addPage();
  }
  
    // Payment Method Distribution - updated to match "Monthly Revenue Trends" style
    doc.fillColor('#111827')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('Payment Method Distribution', 50, doc.y + 20);
    doc.moveDown(1);
  
  if (paymentMethods.length > 0) {
      // Table headers with better styling
      const tableTop = doc.y;
      doc.rect(50, tableTop, 495, 30)
         .fillColor('#1e40af')
         .fill();
         
      doc.fontSize(12)
         .fillColor('#ffffff')
         .font('Helvetica-Bold');
      doc.text('Payment Method', 70, tableTop + 10);
      doc.text('Transactions', 200, tableTop + 10);
      doc.text('Amount', 300, tableTop + 10);
      doc.text('% of Revenue', 400, tableTop + 10);
      
      // Table rows
      paymentMethods.forEach((method, i) => {
        const y = tableTop + 40 + (i * 30);
        
        // Check if we're approaching the footer area
        if (y > doc.page.height - footerMargin - 30) {
          doc.addPage();
          
          // Updated continued header to match consistent style
          doc.fillColor('#111827')
             .fontSize(18)
             .font('Helvetica-Bold')
             .text('Payment Method Distribution (Continued)', 50, 50);
          doc.moveDown(1);
          
          // Add address and contact info
          doc.fontSize(10)
             .fillColor('#4b5563')
             .text('Bandarawela motors, Bandarawela, Sri Lanka', 50, 80, { align: 'center' })
             .text('Tel: +94 76 360 8450', 50, 95, { align: 'center' });
          
          // Recreate header on new page
          const newTableTop = doc.y;
          doc.rect(50, newTableTop, 495, 30)
             .fillColor('#1e40af')
             .fill();
           
          doc.fontSize(12)
             .fillColor('#ffffff')
             .font('Helvetica-Bold');
          doc.text('Payment Method', 70, newTableTop + 10);
          doc.text('Transactions', 200, newTableTop + 10);
          doc.text('Amount', 300, newTableTop + 10);
          doc.text('% of Revenue', 400, newTableTop + 10);
          
          // Reset position counter for new page
          i = -1; // Will become 0 after increment
          return;
        }
        
        // Alternating row colors
        if (i % 2 === 0) {
          doc.rect(50, y - 5, 495, 30)
             .fillColor('#f0f9ff')
             .fill();
        } else {
          doc.rect(50, y - 5, 495, 30)
             .fillColor('#ffffff')
             .fill();
        }
        
        // Format payment method with proper capitalization
        const methodName = method.payment_method 
          ? method.payment_method.charAt(0).toUpperCase() + method.payment_method.slice(1)
          : 'Unknown';
        
        doc.fontSize(11)
           .fillColor('#374151')
           .font('Helvetica');
        doc.text(methodName, 70, y);
        doc.text(method.transaction_count.toString(), 200, y);
        doc.text(formatCurrency(method.total_amount), 300, y);
        
        // Highlight percentage with color
        const percentage = parseFloat(method.percentage).toFixed(2);
        doc.text(`${percentage}%`, 400, y);
      });
    } else {
      doc.text('No payment method data available.', { italics: true });
    }
    
    doc.moveDown(2);
  } catch (error) {
    console.error('Error in generateRevenueReport:', error);
    throw error;
  }
};

// Function to generate detailed payment transactions page
const generatePaymentTransactionsPage = (doc, transactions, startDate, endDate) => {
  // Define footer margin to avoid overlapping with page numbers
  const footerMargin = 40;
  
  try {
    // Setup the header area on the new page with consistent style
    doc.rect(50, 50, 500, 80)
       .fillColor('#f8fafc')
       .fill();
    
    // Add the logo to the header using same function as other pages
    function addCircularImageWithBorder(doc, imagePath, x, y, size, borderWidth = 2, borderColor = '#000000') {
      const centerX = x + size/2;
      const centerY = y + size/2;
      const radius = size/2;
      
      // Save graphics state
      doc.save();
      
      // Create circular clipping path
      doc.circle(centerX, centerY, radius)
         .clip();
      
      // Draw the image
      doc.image(imagePath, x, y, { 
        width: size,
        height: size 
      });
      
      // Restore graphics state
      doc.restore();
      
      // Add border if specified
      if (borderWidth > 0) {
        doc.circle(centerX, centerY, radius)
           .lineWidth(borderWidth)
           .strokeColor(borderColor)
           .stroke();
      }
    }
    
    // Usage:
    addCircularImageWithBorder(doc, logoPath, 60, 60, 70, 3, '#333333');
    
    // Add title and report name next to the logo
    doc.fillColor('#111827')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('Madushani Driving School', 175, 70);
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Payment Transactions', 225, 100);
    
    // Add address and contact info
    doc.fontSize(10)
       .fillColor('#4b5563')
       .text('Bandarawela motors, Bandarawela, Sri Lanka', 50, 120, { align: 'center' })
       .text('Tel: +94 76 360 8450', 50, 135, { align: 'center' });
    
    // Add date range
    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';
    
    doc.fontSize(12)
       .text(`Report Period: ${dateRange}`, 50, 150, { align: 'center' });
    
    // Add a decorative line to separate header from content
    doc.moveTo(100, 175).lineTo(495, 175).lineWidth(1).stroke('#4f46e5');
    
    // Add more vertical space to move the table down
    doc.moveDown(8);
    
    // Payment Transactions Table title - moved down
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#111827')
       .text('Detailed Payment Transactions', 50, 230);
    doc.moveDown(1);
    
    // Table headers - adjusted Y position
    const tableTop = doc.y + 20;
    doc.fontSize(9);
    doc.font('Helvetica-Bold');
    doc.text('Payment ID', 50, tableTop);
    doc.text('Date', 130, tableTop);
    doc.text('Student', 215, tableTop);
    doc.text('Package', 340, tableTop);
    doc.text('Method', 410, tableTop);
    doc.text('Amount', 490, tableTop);
    
    doc.moveDown(0.5);
    
    // Add a line below headers
    doc.moveTo(50, tableTop + 15)
       .lineTo(545, tableTop + 15)
       .lineWidth(0.5)
       .stroke('#e5e7eb');
    
    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica');
      
    transactions.forEach((payment, i) => {
      // Check if we need a new page
      if (y > doc.page.height - footerMargin - 20) {
        doc.addPage();
        
        // Add headers to new page
        doc.fontSize(14).text('Detailed Payment Transactions (Continued)', { underline: true });
        doc.moveDown(0.5);
        
        // Add address and contact info
        doc.fontSize(10)
           .fillColor('#4b5563')
           .text('Bandarawela motors, Bandarawela, Sri Lanka', 50, doc.y, { align: 'center' })
           .text('Tel: +94 76 360 8450', 50, doc.y + 15, { align: 'center' });
        doc.moveDown(1);
        
        // Add table headers
        doc.fontSize(9);
        doc.font('Helvetica-Bold');
        const newTableTop = doc.y + 10;
        doc.text('Payment ID', 50, newTableTop);
        doc.text('Date', 130, newTableTop);
        doc.text('Student', 215, newTableTop);
        doc.text('Package', 340, newTableTop);
        doc.text('Method', 410, newTableTop);
        doc.text('Amount', 490, newTableTop);
        
        // Add a line below headers
        doc.moveTo(50, newTableTop + 15)
           .lineTo(545, newTableTop + 15)
           .lineWidth(0.5)
           .stroke('#e5e7eb');
        
        y = newTableTop + 25;
      }
      
      // Alternating row colors
      if (i % 2 === 1) {
        doc.rect(50, y - 5, 495, 20)
           .fillColor('#f9fafb')
           .fill();
      }
      
      // Format student name - fix to use student_name from query result
      const studentName = payment.student_name || 'Unknown';
      
      // Truncate package name if too long
      const packageName = payment.package_name 
        ? (payment.package_name.length > 25 
            ? payment.package_name.substring(0, 22) + '...' 
            : payment.package_name)
        : 'Unknown';
      
      // Format payment method
      const methodName = payment.payment_method 
        ? payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)
        : 'Unknown';
      
      doc.fillColor('#374151');
      doc.text(payment.payment_id.toString(), 50, y);
      doc.text(payment.payment_date || 'N/A', 130, y);
      doc.text(studentName, 215, y);
      doc.text(packageName, 340, y);
      doc.text(methodName, 410, y);
      doc.text(formatCurrency(payment.amount), 490, y);
      
      y += 20;
    });
    
    // Add a summary at the bottom
    doc.moveDown(2);
    doc.font('Helvetica-Bold');
    doc.text(`Total Transactions: ${transactions.length}`, 50, doc.y);
    
    const totalAmount = transactions.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 50, doc.y + 20);
    
  } catch (error) {
    console.error('Error generating payment transactions page:', error);
    doc.text('Error generating payment transactions.', 50, doc.y);
  }
}; 