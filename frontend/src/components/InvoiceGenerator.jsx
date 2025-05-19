import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/formatters';
import './InvoiceGenerator.css';

// Modern color palette
const COLORS = {
  primary: [41, 128, 185],       // Blue
  secondary: [26, 188, 156],     // Teal
  accent: [231, 76, 60],         // Red
  dark: [52, 73, 94],            // Dark Blue
  light: [236, 240, 241],        // Light Gray
  medium: [189, 195, 199],       // Medium Gray
  text: [44, 62, 80],            // Dark Text
  success: [46, 204, 113],       // Green
  warning: [230, 126, 34]        // Orange
};

const InvoiceGenerator = ({ payment, student, packageDetails, allPayments }) => {
  const generateInvoice = () => {
    try {
      // Create new PDF document - use portrait for better fit
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Check if required data is available
      if (!payment || !student) {
        console.error('Missing required payment or student data for invoice generation');
        alert('Cannot generate invoice: Missing required data');
        return;
      }
      
      // Safely access package details
      const packageName = packageDetails?.packageName || packageDetails?.name || 'Driving Course';
      const packagePrice = parseFloat(packageDetails?.price || 0);
      
      // Set document properties
      doc.setProperties({
        title: `Invoice #INV-${payment.id || payment.payment_id}`,
        subject: 'Payment Receipt',
        author: 'Madushani Driving School',
        keywords: 'invoice, payment, receipt',
        creator: 'Madushani Driving School'
      });
      
      // Create a gradient-like header effect
      doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setFillColor(COLORS.primary[0] - 10, COLORS.primary[1] - 10, COLORS.primary[2] - 10);
      doc.rect(0, 30, 210, 10, 'F'); // Darker shade at bottom for gradient effect
      
      // Add logo or school name with professional typography
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text('MADUSHANI', 20, 20);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('DRIVING SCHOOL', 20, 27);
      
      // Add invoice title with more elegant styling
      doc.setFontSize(30);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 150, 25);
      
      // Add a colored band for invoice details with subtle gradient
      doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
      doc.rect(0, 40, 210, 15, 'F');
      doc.setFillColor(COLORS.secondary[0] - 5, COLORS.secondary[1] - 5, COLORS.secondary[2] - 5);
      doc.rect(0, 48, 210, 7, 'F'); // Subtle gradient effect
      
      // Add invoice number and date on colored band
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const paymentId = payment.id || payment.payment_id || 'Unknown';
      doc.text(`INVOICE #INV-${paymentId}`, 20, 49);
      
      const dateStr = new Date(payment.transaction_date || payment.date || new Date()).toLocaleDateString();
      doc.text(`DATE: ${dateStr}`, 150, 49);
      
      // Set text color for the rest of the document
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      
      // Billing section with improved spacing
      const billingStartY = 70;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO', 20, billingStartY);
      
      // Add subtle decorative element
      doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.setLineWidth(0.5);
      doc.line(20, billingStartY + 2, 45, billingStartY + 2);
      
      // Student info box with subtle background and rounded corners effect
      doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
      // Main rectangle
      doc.roundedRect(20, billingStartY + 5, 80, 35, 2, 2, 'F');
      // Border
      doc.setDrawColor(COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]);
      doc.setLineWidth(0.1);
      doc.roundedRect(20, billingStartY + 5, 80, 35, 2, 2, 'S');
      
      // Student details with improved font
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      
      // Safely get student name
      const studentName = student.name || 
                         (student.firstName && student.lastName ? 
                          `${student.firstName} ${student.lastName}` : 
                          (student.FIRST_NAME && student.LAST_NAME ? 
                           `${student.FIRST_NAME} ${student.LAST_NAME}` : 'N/A'));
      
      doc.text(studentName, 25, billingStartY + 13);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // Safely get contact details
      const phoneNumber = student.phoneNumber || student.phone || student.PHONE_NUMBER || student.contactNumber || 'N/A';
      const email = student.email || student.EMAIL || 'N/A';
      const address = student.address || student.ADDRESS || 'N/A';
      
      // Format address for display
      let displayAddress = address;
      if (address.length > 35) {
        const lines = doc.splitTextToSize(address, 70);
        displayAddress = lines;
      }
      
      doc.text(`Tel: ${phoneNumber}`, 25, billingStartY + 20);
      doc.text(`Email: ${email}`, 25, billingStartY + 27);
      doc.text(displayAddress, 25, billingStartY + 34);
      
      // Driving school info on the right
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FROM', 120, billingStartY);
      
      // Decorative element for FROM section
      doc.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
      doc.line(120, billingStartY + 2, 145, billingStartY + 2);
      
      // School info box with subtle background and rounded corners
      doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
      doc.roundedRect(120, billingStartY + 5, 70, 35, 2, 2, 'F');
      doc.setDrawColor(COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]);
      doc.roundedRect(120, billingStartY + 5, 70, 35, 2, 2, 'S');
      
      // School details
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Madushani Driving School', 125, billingStartY + 13);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('123 Driving School Road', 125, billingStartY + 20);
      doc.text('Colombo, Sri Lanka', 125, billingStartY + 27);
      doc.text('Tel: +94 123-456-789', 125, billingStartY + 34);
      
      // Calculate payment values
      const currentPayment = parseFloat(payment.amount) || 0;
      let previousPaymentsTotal = 0;
      let allSuccessfulPayments = [];
      
      // If allPayments array is provided, use it to calculate total
      if (allPayments && Array.isArray(allPayments)) {
        // Filter for all 'paid' payments, including the current one
        allSuccessfulPayments = allPayments.filter(p => {
          return p.status && 
            (p.status.toLowerCase() === 'paid' || p.status.toLowerCase() === 'approved');
        });
        
        // Calculate total of ALL paid payments (including current)
        const totalSuccessfulPayments = allSuccessfulPayments.reduce((sum, p) => {
          const amount = parseFloat(p.amount) || 0;
          return sum + amount;
        }, 0);
        
        // Subtract current payment to get previous payments total
        previousPaymentsTotal = totalSuccessfulPayments - currentPayment;
      } else if (payment.previous_payments) {
        // Fallback to previous_payments property if available
        previousPaymentsTotal = parseFloat(payment.previous_payments) || 0;
      }
      
      // Ensure we don't get negative values for previous payments
      previousPaymentsTotal = Math.max(0, previousPaymentsTotal);
      
      const totalPaid = currentPayment + previousPaymentsTotal;
      const remainingAmount = Math.max(0, packagePrice - totalPaid);
      
      // Payment details table
      const paymentTableY = billingStartY + 50;
      
      // Payment table title with refined background and subtle shadow effect
      doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.roundedRect(20, paymentTableY, 170, 10, 2, 2, 'F');
      // Shadow effect
      doc.setFillColor(200, 200, 200, 0.5);
      doc.rect(20, paymentTableY + 10, 170, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DETAILS', 105, paymentTableY + 7, { align: 'center' });
      
      // Create a table for the payment details - with reduced column widths
      const tableColumn = ["Description", "Amount"];
      const tableRows = [
        [`Payment for: ${packageName}`, formatCurrency(currentPayment)]
      ];
      
      // Use the imported autoTable function with proper width settings
      autoTable(doc, {
        startY: paymentTableY + 15,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'left',
          font: 'helvetica' // Use standard font
        },
        styles: {
          cellPadding: 8,
          fontSize: 10,
          lineColor: [COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]],
          font: 'helvetica' // Use standard font
        },
        // Fix column widths to fit page
        columnStyles: {
          0: { 
            cellWidth: 110,
            fontStyle: 'bold'
          },
          1: { 
            cellWidth: 40,
            halign: 'right',
            fontStyle: 'normal'
          }
        },
        alternateRowStyles: {
          fillColor: [COLORS.light[0], COLORS.light[1], COLORS.light[2]]
        },
        // Set explicit table width
        tableWidth: 'auto',
        margin: { left: 20, right: 20 }
      });
      
      // Get the final Y position after the table
      const finalTableY = doc.lastAutoTable.finalY + 5;
      
      // Payment summary section with rounded corners
      doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
      doc.roundedRect(20, finalTableY, 170, 50, 3, 3, 'F');
      // Add subtle border
      doc.setDrawColor(COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]);
      doc.setLineWidth(0.1);
      doc.roundedRect(20, finalTableY, 170, 50, 3, 3, 'S');
      
      // Left side - Package details
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Package Details', 30, finalTableY + 10);
      // Add decorative underline
      doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.setLineWidth(0.5);
      doc.line(30, finalTableY + 12, 80, finalTableY + 12);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Package: ${packageName}`, 30, finalTableY + 20);
      doc.text(`Total Package Price: ${formatCurrency(packagePrice)}`, 30, finalTableY + 30);
      
      // Right side - Payment summary with colored bullets
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Summary', 120, finalTableY + 10);
      // Add decorative underline
      doc.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
      doc.line(120, finalTableY + 12, 180, finalTableY + 12);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Payment summary items with modern design
      // Previous payments
      doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.circle(115, finalTableY + 20, 2, 'F');
      doc.text('Previous Payments:', 120, finalTableY + 20);
      doc.text(formatCurrency(previousPaymentsTotal), 180, finalTableY + 20, { align: 'right' });
      
      // Current payment
      doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
      doc.circle(115, finalTableY + 30, 2, 'F');
      doc.text('This Payment:', 120, finalTableY + 30);
      doc.text(formatCurrency(currentPayment), 180, finalTableY + 30, { align: 'right' });
      
      // Total paid
      doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
      doc.circle(115, finalTableY + 40, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Total Paid:', 120, finalTableY + 40);
      doc.text(formatCurrency(totalPaid), 180, finalTableY + 40, { align: 'right' });
      
      // Border for the remaining balance with rounded corners
      const balanceY = finalTableY + 60;
      doc.setFillColor(
        remainingAmount > 0 ? COLORS.accent[0] : COLORS.success[0],
        remainingAmount > 0 ? COLORS.accent[1] : COLORS.success[1],
        remainingAmount > 0 ? COLORS.accent[2] : COLORS.success[2]
      );
      doc.roundedRect(20, balanceY - 10, 170, 15, 3, 3, 'F');
      
      // Add subtle shadow effect
      doc.setFillColor(180, 180, 180, 0.3);
      doc.rect(20, balanceY + 5, 170, 2, 'F');
      
      // Remaining balance with special styling
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('REMAINING BALANCE:', 30, balanceY);
      doc.text(formatCurrency(remainingAmount), 180, balanceY, { align: 'right' });
      
      // Add footer with gradient effect
      const footerY = 270;
      doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
      doc.rect(0, footerY, 210, 25, 'F');
      doc.setFillColor(COLORS.dark[0] + 15, COLORS.dark[1] + 15, COLORS.dark[2] + 15);
      doc.rect(0, footerY, 210, 5, 'F'); // Lighter shade at top for gradient effect
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('THANK YOU FOR YOUR BUSINESS', 105, footerY + 10, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('This is an official receipt. No signature required.', 105, footerY + 16, { align: 'center' });
      doc.text('© Madushani Driving School', 105, footerY + 22, { align: 'center' });
      
      // Save the PDF
      doc.save(`invoice-${paymentId}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again later.');
    }
  };

  return (
    <button 
      className="invoice-btn"
      onClick={generateInvoice}
      disabled={payment?.status?.toLowerCase() !== 'paid' && payment?.status?.toLowerCase() !== 'approved'}
      title={payment?.status?.toLowerCase() === 'paid' || payment?.status?.toLowerCase() === 'approved' ? 'Download Invoice' : 'Only available for paid payments'}
    >
      <i className="bi bi-file-earmark-pdf"></i>
      <span>Invoice</span>
    </button>
  );
};

export default InvoiceGenerator; 