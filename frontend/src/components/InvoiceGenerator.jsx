import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/formatters';
import './InvoiceGenerator.css';

// Professional color palette for invoices
const COLORS = {
  primary: [40, 60, 80],        // Dark blue-gray
  secondary: [70, 100, 130],    // Medium blue-gray
  accent: [180, 50, 50],        // Muted red
  dark: [50, 50, 50],           // Dark gray
  light: [245, 245, 245],       // Light gray
  medium: [200, 200, 200],      // Medium gray
  text: [30, 30, 30],           // Dark text
  success: [60, 130, 80],       // Subdued green
  warning: [190, 130, 40]       // Subdued orange
};

const InvoiceGenerator = ({ payment, student, packageDetails, allPayments }) => {
  const generateInvoice = () => {
    try {
      // Create new PDF document
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
      
      // Create header (without background color)
      // doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      // doc.rect(0, 0, 210, 30, 'F');
      
      // Add logo 
      const logoPath = process.env.PUBLIC_URL + '/images/icon01.jpg';
      // Create an image element to get dimensions
      const img = new Image();
      img.src = logoPath;
      
      // Wait for image to load before adding to PDF
      img.onload = function() {
        // Calculate height while maintaining aspect ratio (maximum height 20mm)
        const imgHeight = Math.min(20, (img.height * 20) / img.width);
        
        // Add image to the left side of the header
        doc.addImage(logoPath, 'JPEG', 35, 5, 20, imgHeight);
        
        // Add school name - moved slightly to the right to accommodate logo
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('MADUSHANI DRIVING SCHOOL', 115, 20, { align: 'center' });
        
        // Add a divider line below the header
        doc.setDrawColor(COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]);
        doc.setLineWidth(0.5);
        doc.line(10, 30, 200, 30);
        
        // Continue with the rest of the PDF generation
        continueWithPdfGeneration();
      };
      
      // Function to continue with PDF generation after image loading
      function continueWithPdfGeneration() {
        // Add invoice title
        doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
        doc.rect(0, 35, 210, 10, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const paymentId = payment.id || payment.payment_id || 'Unknown';
        doc.text(`INVOICE #INV-${paymentId}`, 105, 42, { align: 'center' });
        
        // Set text color for the rest of the document
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        
        // Date section
        const dateStr = new Date(payment.transaction_date || payment.date || new Date()).toLocaleDateString();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${dateStr}`, 170, 55, { align: 'right' });
        
        // Billing section
        const billingStartY = 65;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO', 20, billingStartY);
        
        // Add decorative line
        doc.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
        doc.setLineWidth(0.5);
        doc.line(20, billingStartY + 2, 45, billingStartY + 2);
        
        // Student info box
        doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
        doc.rect(20, billingStartY + 5, 80, 35, 'F');
        
        // Border
        doc.setDrawColor(COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]);
        doc.setLineWidth(0.1);
        doc.rect(20, billingStartY + 5, 80, 35, 'S');
        
        // Student details
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
        const address = student.address || student.ADDRESS || 'N/A';
        const email = student.email || student.EMAIL || 'N/A';
        const phoneNumber = student.phoneNumber || student.phone || student.PHONE_NUMBER || student.contactNumber || 'N/A';
        
        // Format address for display
        let displayAddress = address;
        if (address.length > 35) {
          const lines = doc.splitTextToSize(address, 70);
          displayAddress = lines;
        }
        
        // Display details in the new order: Name (already shown above), Address, Email, Phone
        doc.text(displayAddress, 25, billingStartY + 20);
        doc.text(`Email: ${email}`, 25, billingStartY + 27);
        doc.text(`Tel: ${phoneNumber}`, 25, billingStartY + 34);

        // Driving school info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('FROM', 120, billingStartY);
        
        // Decorative line
        doc.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
        doc.line(120, billingStartY + 2, 145, billingStartY + 2);
        
        // School info box
        doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
        doc.rect(120, billingStartY + 5, 70, 35, 'F');
        doc.setDrawColor(COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]);
        doc.rect(120, billingStartY + 5, 70, 35, 'S');
        
        // School details
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Madushani Driving School', 125, billingStartY + 13);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Bandarawela Motors, Bandarawela, SriLanka', 125, billingStartY + 20);
        doc.text('Email: mds@gmail.com', 125, billingStartY + 27);
        doc.text('Tel: +94 763 608 451', 125, billingStartY + 34);
        
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
        
        // Payment table header
        doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
        doc.rect(20, paymentTableY, 170, 10, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT DETAILS', 105, paymentTableY + 7, { align: 'center' });
        
        // Create table for the payment details
        const tableColumn = ["Description", "Amount"];
        const tableRows = [
          [`Payment for: ${packageName}`, formatCurrency(currentPayment)]
        ];
        
        // Use the autoTable plugin with fixed width matching other components
        autoTable(doc, {
          startY: paymentTableY + 15,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: {
            fillColor: [COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'left'
          },
          styles: {
            cellPadding: 8,
            fontSize: 10,
            lineColor: [COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]]
          },
          columnStyles: {
            0: { cellWidth: 130 },  // Increased width for description
            1: { cellWidth: 40, halign: 'right' }
          },
          alternateRowStyles: {
            fillColor: [COLORS.light[0], COLORS.light[1], COLORS.light[2]]
          },
          // Set exact table width to match other components (170mm)
          tableWidth: 170,
          // Remove margins since we're setting absolute width
          margin: { left: 20, right: 20 },
          // Ensure the table starts at the exact position we want
          startX: 20
        });
        
        // Get the final Y position after the table
        const finalTableY = doc.lastAutoTable.finalY + 10;
        
        // Payment summary section
        doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
        doc.rect(20, finalTableY, 170, 50, 'F');
        doc.setDrawColor(COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]);
        doc.rect(20, finalTableY, 170, 50, 'S');
        
        // Left side - Package details
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Package Details', 30, finalTableY + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Package: ${packageName}`, 30, finalTableY + 20);
        doc.text(`Total Package Price: ${formatCurrency(packagePrice)}`, 30, finalTableY + 30);
        
        // Right side - Payment summary
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Summary', 120, finalTableY + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Previous payments
        doc.text('Previous Payments:', 120, finalTableY + 20);
        doc.text(formatCurrency(previousPaymentsTotal), 180, finalTableY + 20, { align: 'right' });
        
        // Current payment
        doc.text('This Payment:', 120, finalTableY + 30);
        doc.text(formatCurrency(currentPayment), 180, finalTableY + 30, { align: 'right' });
        
        // Total paid
        doc.setFont('helvetica', 'bold');
        doc.text('Total Paid:', 120, finalTableY + 40);
        doc.text(formatCurrency(totalPaid), 180, finalTableY + 40, { align: 'right' });
        
        // Remaining balance section
        const balanceY = finalTableY + 60;
        doc.setFillColor(
          remainingAmount > 0 ? COLORS.accent[0] : COLORS.success[0],
          remainingAmount > 0 ? COLORS.accent[1] : COLORS.success[1],
          remainingAmount > 0 ? COLORS.accent[2] : COLORS.success[2]
        );
        doc.rect(20, balanceY - 10, 170, 15, 'F');
        
        // Remaining balance text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('REMAINING BALANCE:', 30, balanceY);
        doc.text(formatCurrency(remainingAmount), 180, balanceY, { align: 'right' });
        
        // Add simple footer
        const footerY = 270;
        doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
        doc.rect(0, footerY, 210, 20, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('THANK YOU FOR YOUR BUSINESS', 105, footerY + 10, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('© Madushani Driving School | This is an official receipt.', 105, footerY + 16, { align: 'center' });
        
        // Save the PDF
        doc.save(`invoice-${paymentId}.pdf`);
      }
      
      // Fallback if image fails to load
      img.onerror = function() {
        console.error('Failed to load logo image');
        
        // Just add the text without the image
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('MADUSHANI DRIVING SCHOOL', 105, 20, { align: 'center' });
        
        // Add a divider line below the header
        doc.setDrawColor(COLORS.medium[0], COLORS.medium[1], COLORS.medium[2]);
        doc.setLineWidth(0.5);
        doc.line(10, 30, 200, 30);
        
        // Continue with the rest of the PDF generation
        continueWithPdfGeneration();
      };
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