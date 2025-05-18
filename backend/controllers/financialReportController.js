import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getRevenueData, 
  getRevenueByPackage, 
  getPaymentMethodDistribution,
  calculateProfitMetrics,
  getMonthlyProfitTrends
} from '../models/financialReportModel.js';

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
      reportType = 'full' // "full", "revenue", "profit", "summary"
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
    const profitMetrics = await calculateProfitMetrics(startDate, endDate);
    const monthlyProfits = await getMonthlyProfitTrends(startDate, endDate);
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Generate appropriate report based on type
    if (reportType === 'full' || reportType === 'summary') {
      generateSummaryReport(doc, profitMetrics, startDate, endDate, revenueData);
    }
    
    if (reportType === 'full' || reportType === 'revenue') {
      if (reportType !== 'summary') {
        generateRevenueReport(doc, revenueData, packageRevenue, paymentMethods);
      }
    }
    
    if (reportType === 'full' || reportType === 'profit') {
      generateProfitReport(doc, profitMetrics, monthlyProfits);
    }
    
    // Finalize and end the document
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
const generateSummaryReport = (doc, profitMetrics, startDate, endDate, revenueData) => {
  try {
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
    
    // ---------- REVENUE OVERVIEW SECTION ----------
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#111827')
       .text('Revenue Overview', 50, 210);
    
    // Add total revenue highlight box
    doc.rect(50, 240, 230, 100)
       .fillColor('#f0f9ff')
       .fill();
    
    doc.rect(50, 240, 230, 30)
       .fillColor('#0284c7')
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('TOTAL REVENUE', 65, 250);
    
    doc.fillColor('#0284c7')
       .fontSize(24)
       .text(formatCurrency(profitMetrics.totalRevenue), 65, 285);
    
    // Add profit highlight box
    doc.rect(310, 240, 230, 100)
       .fillColor('#f0fdf4')
       .fill();
    
    doc.rect(310, 240, 230, 30)
       .fillColor('#059669')
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('NET PROFIT', 325, 250);
    
    doc.fillColor('#059669')
       .fontSize(24)
       .text(formatCurrency(profitMetrics.netProfit), 325, 285);
    
    // ---------- MONTHLY REVENUE SECTION ----------
    doc.fillColor('#111827')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Monthly Revenue Trends', 50, 370);
    
    // Create a table for monthly revenue
    if (revenueData && revenueData.length > 0) {
      // Table header
      doc.rect(50, 400, 495, 30)
         .fillColor('#f8fafc')
         .fill();
      
      doc.fillColor('#111827')
         .fontSize(12)
         .font('Helvetica-Bold');
      
      doc.text('Month', 70, 410);
      doc.text('Revenue', 190, 410);
      doc.text('Transactions', 320, 410);
      doc.text('Avg. Transaction', 440, 410);
      
      // Table rows for monthly data (limit to 6 most recent months on first page)
      const recentMonths = revenueData.slice(-6); // Get 6 most recent months
      
      recentMonths.forEach((month, i) => {
        const y = 440 + (i * 30);
        
        // Alternating row colors
        if (i % 2 === 0) {
          doc.rect(50, y - 10, 495, 30)
             .fillColor('#f9fafb')
             .fill();
        }
        
        // Format date from YYYY-MM to MMM YYYY
        const monthDate = new Date(month.month + '-01');
        const formattedMonth = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        // Print row data
        doc.fillColor('#374151')
           .fontSize(11)
           .font('Helvetica');
        
        doc.text(formattedMonth, 70, y);
        doc.text(formatCurrency(month.total_revenue), 190, y);
        doc.text(month.transaction_count.toString(), 320, y);
        doc.text(formatCurrency(month.average_transaction), 440, y);
      });
      
      // Add a note if there are more months not shown
      if (revenueData.length > 6) {
        doc.fillColor('#6b7280')
           .fontSize(10)
           .font('Helvetica-Italic')
           .text(`* Showing ${recentMonths.length} most recent months out of ${revenueData.length} total months.`, 
                 50, 440 + (recentMonths.length * 30) + 10);
      }
    } else {
      doc.fillColor('#6b7280')
         .fontSize(12)
         .font('Helvetica-Italic')
         .text('No monthly revenue data available for the selected period.', 50, 410);
    }
    
    // ---------- REVENUE VISUALIZATION ----------
    // If we have at least 3 months of data, add a simple bar visualization
    if (revenueData && revenueData.length >= 3) {
      const visualizationData = revenueData.slice(-6); // Last 6 months
      const maxRevenue = Math.max(...visualizationData.map(d => parseFloat(d.total_revenue || 0)));
      const barHeight = 150; // Max height for bars
      
      doc.addPage(); // Add a new page for the visualization
      
      // Add header to the new page
      try {
        doc.rect(50, 50, 495, 70)
           .fillColor('#f8fafc')
           .fill();
        
        // Add the logo smaller on second page
        doc.image(logoPath, 60, 55, { 
          width: 50,
          height: 50 
        });
        
        doc.fillColor('#111827')
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('Revenue Visualization', 120, 65);
        
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Report Period: ${dateRange}`, 120, 90);
      } catch (error) {
        console.error('Error adding logo to second page:', error);
        // Fallback header
        doc.fontSize(18).text('Revenue Visualization', { align: 'center' });
      }
      
      // Create bar chart title
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Monthly Revenue Comparison', 50, 150);
      
      // Draw baseline
      const baselineY = 350;
      doc.moveTo(70, baselineY).lineTo(530, baselineY).lineWidth(1).stroke('#d1d5db');
      
      // Draw bars
      const barWidth = 60;
      const spacing = 30;
      let startX = 90;
      
      visualizationData.forEach((month, i) => {
        const revenue = parseFloat(month.total_revenue || 0);
        const percentage = revenue / maxRevenue;
        const currentBarHeight = Math.max(percentage * barHeight, 5); // Minimum bar height of 5
        
        // Format date for label
        const monthDate = new Date(month.month + '-01');
        const formattedMonth = monthDate.toLocaleString('default', { month: 'short' });
        const formattedYear = monthDate.toLocaleString('default', { year: '2-digit' });
        
        // Draw the bar
        doc.rect(startX, baselineY - currentBarHeight, barWidth, currentBarHeight)
           .fillColor('#4f46e5')
           .fill();
        
        // Add month label
        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text(`${formattedMonth}'${formattedYear}`, startX, baselineY + 10, {
             width: barWidth,
             align: 'center'
           });
        
        // Add revenue value on top of bar
        if (currentBarHeight > 25) {
          doc.fillColor('#ffffff')
             .fontSize(9)
             .text(formatCurrency(revenue), startX, baselineY - currentBarHeight + 10, {
               width: barWidth,
               align: 'center'
             });
        } else {
          doc.fillColor('#111827')
             .fontSize(9)
             .text(formatCurrency(revenue), startX, baselineY - currentBarHeight - 15, {
               width: barWidth,
               align: 'center'
             });
        }
        
        // Move to next bar position
        startX += barWidth + spacing;
      });
    }
    
  } catch (error) {
    console.error('Error generating summary report:', error);
    
    // Fallback without formatting if there's an error
    doc.fontSize(25).text('Madushani Driving School', { align: 'center' });
    doc.fontSize(18).text('Financial Summary Report', { align: 'center' });
    
    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';
    
    doc.fontSize(12).text(`Report Period: ${dateRange}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add simple revenue data
    doc.fontSize(16).text('Revenue Summary', { underline: true });
    doc.moveDown(1);
    
    const formatCurrency = (amount) => `Rs. ${parseFloat(amount || 0).toFixed(2)}`;
    
    doc.fontSize(12).text(`Total Revenue: ${formatCurrency(profitMetrics.totalRevenue)}`);
    doc.fontSize(12).text(`Net Profit: ${formatCurrency(profitMetrics.netProfit)}`);
    doc.fontSize(12).text(`Profit Margin: ${profitMetrics.netProfitMargin.toFixed(2)}%`);
    
    if (revenueData && revenueData.length > 0) {
      doc.moveDown(1);
      doc.fontSize(14).text('Monthly Revenue Data', { underline: true });
      doc.moveDown(0.5);
      
      revenueData.forEach(month => {
        const monthDate = new Date(month.month + '-01');
        const formattedMonth = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        doc.text(`${formattedMonth}: ${formatCurrency(month.total_revenue)}`);
      });
    }
  }
};

// Function to generate revenue report section
const generateRevenueReport = (doc, revenueData, packageRevenue, paymentMethods) => {
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
      if (y > doc.page.height - 100) {
        doc.addPage();
        doc.fontSize(14).text('Monthly Revenue (Continued)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
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
      if (y > doc.page.height - 100) {
        doc.addPage();
        doc.fontSize(14).text('Revenue by Package (Continued)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
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

// Function to generate profit report section
const generateProfitReport = (doc, profitMetrics, monthlyProfits) => {
  doc.addPage();
  doc.fontSize(18).text('Profit & Loss Analysis', { align: 'center' });
  doc.moveDown(1);
  
  // P&L Statement
  doc.fontSize(14).text('Profit & Loss Statement', { underline: true });
  doc.moveDown(0.5);
  
  // Create a table for P&L
  const tableTop = doc.y + 10;
  doc.fontSize(12);
  
  doc.text('Revenue', 100, tableTop);
  doc.text(`Rs. ${parseFloat(profitMetrics.totalRevenue || 0).toFixed(2)}`, 300, tableTop);
  
  doc.text('Less: Variable Costs', 100, tableTop + 20);
  doc.text(`Rs. ${parseFloat(profitMetrics.variableCosts || 0).toFixed(2)}`, 300, tableTop + 20);
  
  doc.text('Gross Profit', 100, tableTop + 40, { bold: true });
  doc.text(`Rs. ${parseFloat(profitMetrics.grossProfit || 0).toFixed(2)}`, 300, tableTop + 40, { bold: true });
  
  doc.text('Less: Fixed Costs', 100, tableTop + 60);
  doc.text(`Rs. ${parseFloat(profitMetrics.fixedCosts || 0).toFixed(2)}`, 300, tableTop + 60);
  
  doc.text('Net Profit', 100, tableTop + 80, { bold: true });
  doc.text(`Rs. ${parseFloat(profitMetrics.netProfit || 0).toFixed(2)}`, 300, tableTop + 80, { bold: true });
  
  doc.moveDown(5);
  
  // Profitability Metrics
  doc.fontSize(14).text('Profitability Metrics', { underline: true });
  doc.moveDown(0.5);
  
  const metricsTop = doc.y + 10;
  doc.fontSize(12);
  
  doc.text('Gross Profit Margin', 100, metricsTop);
  doc.text(`${profitMetrics.grossProfitMargin.toFixed(2)}%`, 300, metricsTop);
  
  doc.text('Net Profit Margin', 100, metricsTop + 20);
  doc.text(`${profitMetrics.netProfitMargin.toFixed(2)}%`, 300, metricsTop + 20);
  
  doc.moveDown(2);
  
  // Monthly Profit Trends
  doc.fontSize(14).text('Monthly Profit Trends', { underline: true });
  doc.moveDown(0.5);
  
  if (monthlyProfits.length > 0) {
    // Table headers
    const trendsTop = doc.y + 10;
    doc.fontSize(10);
    doc.text('Month', 50, trendsTop);
    doc.text('Revenue', 150, trendsTop);
    doc.text('Costs', 250, trendsTop);
    doc.text('Profit', 350, trendsTop);
    doc.text('Margin', 450, trendsTop);
    
    doc.moveDown(0.5);
    
    // Table rows
    monthlyProfits.forEach((month, i) => {
      const y = trendsTop + 20 + (i * 20);
      if (y > doc.page.height - 100) {
        doc.addPage();
        doc.fontSize(14).text('Monthly Profit Trends (Continued)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
      }
      
      // Format date from YYYY-MM to MMM YYYY
      const monthDate = new Date(month.month + '-01');
      const formattedMonth = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      doc.text(formattedMonth, 50, y);
      doc.text(`Rs. ${parseFloat(month.revenue).toFixed(2)}`, 150, y);
      doc.text(`Rs. ${parseFloat(month.costs).toFixed(2)}`, 250, y);
      doc.text(`Rs. ${parseFloat(month.profit).toFixed(2)}`, 350, y);
      doc.text(`${parseFloat(month.profitMargin).toFixed(2)}%`, 450, y);
    });
  } else {
    doc.text('No monthly profit data available for the selected period.', { italics: true });
  }
  
  doc.moveDown(2);
  
  // Add footer with disclaimer
  const pageBottom = doc.page.height - 50;
  doc.fontSize(8).text(
    'Note: This financial report is for internal management purposes only. ' +
    'Cost figures are based on standard estimates and may not reflect actual expenses.',
    50, pageBottom, { align: 'center', width: 500 }
  );
}; 