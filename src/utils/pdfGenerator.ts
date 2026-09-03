/**
 * PDF Generator for Quotations & Invoices using jsPDF and jspdf-autotable
 * Produces crisp, selectable-text A4 documents with Shiftify branding.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuotationRecord, InvoiceRecord } from '../types/admin';
import { COMPANY_INFO } from '../data/companyData';

export function formatINR(amount?: number | null): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : (Number(amount) || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/**
 * Generate and download Quotation PDF
 */
export function downloadQuotationPdf(quotation: QuotationRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header Brand Accent Bar
  doc.setFillColor(234, 88, 12); // Orange-600
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Company Name & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(24, 24, 27); // Zinc 900
  doc.text('SHIFTIFY PACKERS & MOVERS', 14, (y += 8));

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122); // Zinc 500
  doc.text('Professional Relocation, Packaging & Logistics Solutions', 14, (y += 5));
  doc.text(`Phone: ${COMPANY_INFO.phone}  |  Email: ${COMPANY_INFO.email}  |  Web: ${COMPANY_INFO.website}`, 14, (y += 4.5));
  doc.text('Headquarters: HSR Layout, Sector 2, Bangalore, Karnataka - 560102', 14, (y += 4.5));

  // Document Title Banner (Right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(234, 88, 12); // Orange
  doc.text('RELOCATION QUOTATION', pageWidth - 14, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Quotation #: ${quotation.quotationId}`, pageWidth - 14, 28, { align: 'right' });
  doc.text(`Date: ${quotation.quotationDate}`, pageWidth - 14, 33, { align: 'right' });
  doc.text(`Valid Until: ${quotation.validUntil}`, pageWidth - 14, 38, { align: 'right' });
  doc.text(`Status: ${quotation.status}`, pageWidth - 14, 43, { align: 'right' });

  // Divider Line
  y += 6;
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);

  // Bill To / Relocation Details Box
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'S');

  // Customer column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('QUOTATION FOR:', 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text(quotation.customerName, 18, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: +91 ${quotation.phone}`, 18, y + 17);
  if (quotation.email) {
    doc.text(`Email: ${quotation.email}`, 18, y + 22);
  }

  // Moving Route column
  const midX = 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('MOVE PARTICULARS:', midX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Service Type: ${quotation.movingType}`, midX, y + 11);
  doc.text(`Moving Date: ${quotation.movingDate}`, midX, y + 16);
  doc.text(`Pickup (From): ${quotation.fromLocation}`, midX, y + 21);
  doc.text(`Destination (To): ${quotation.toLocation}`, midX, y + 26);

  // Charges Table
  y += 34;
  const tableData = quotation.items.map((item, idx) => [
    idx + 1,
    item.description,
    item.quantity,
    formatINR(item.unitPrice),
    formatINR(item.total ?? item.amount ?? (Number(item.quantity) * Number(item.unitPrice))),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Charge Description', 'Qty', 'Unit Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 32 },
    },
    margin: { left: 14, right: 14 },
  });

  // Calculate totals position
  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Financial summary box (Right-aligned)
  const summaryBoxWidth = 85;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let currentY = finalY;

  // Subtotal
  doc.text('Subtotal:', summaryBoxX, currentY);
  doc.text(formatINR(quotation.subtotal), pageWidth - 14, currentY, { align: 'right' });

  if (quotation.discount > 0) {
    currentY += 5;
    doc.text('Discount:', summaryBoxX, currentY);
    doc.text(`- ${formatINR(quotation.discount)}`, pageWidth - 14, currentY, { align: 'right' });

    currentY += 5;
    doc.text('Taxable Amount:', summaryBoxX, currentY);
    doc.text(formatINR(quotation.taxableAmount), pageWidth - 14, currentY, { align: 'right' });
  }

  if (quotation.gstAmount > 0) {
    currentY += 5;
    doc.text(`GST (${quotation.gstPercentage}%):`, summaryBoxX, currentY);
    doc.text(formatINR(quotation.gstAmount), pageWidth - 14, currentY, { align: 'right' });
  }

  currentY += 6;
  doc.setFillColor(255, 247, 237); // Orange-50
  doc.rect(summaryBoxX - 2, currentY - 4, summaryBoxWidth + 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(234, 88, 12);
  doc.text('Grand Total:', summaryBoxX, currentY + 1.5);
  doc.text(formatINR(quotation.grandTotal), pageWidth - 14, currentY + 1.5, { align: 'right' });

  // Notes & Terms
  let notesY = finalY;
  const notesWidth = summaryBoxX - 20;

  if (quotation.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Notes / Special Instructions:', 14, notesY);
    notesY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(quotation.notes, notesWidth);
    doc.text(splitNotes, 14, notesY);
    notesY += splitNotes.length * 3.5 + 4;
  }

  const termsText =
    quotation.terms ||
    '1. Quotation valid for 7 days from issue.\n2. 50% advance on confirmation, balance upon unloading.\n3. Goods transit insurance optional upon prior declaration.\n4. Standard packing materials included.';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Terms & Conditions:', 14, notesY);
  notesY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const splitTerms = doc.splitTextToSize(termsText, notesWidth);
  doc.text(splitTerms, 14, notesY);

  // Footer / Signatory
  const footerY = Math.max(currentY + 25, notesY + 15, 260);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated quotation from Shiftify Logistics.', 14, footerY + 5);
  doc.text('Authorized Signatory - Shiftify Packers & Movers', pageWidth - 14, footerY + 5, { align: 'right' });

  doc.save(`${quotation.quotationId}_Shiftify_Quotation.pdf`);
}

/**
 * Generate and download Invoice PDF
 */
export function downloadInvoicePdf(invoice: InvoiceRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header Brand Accent Bar (Emerald / Blue for Invoice)
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Company Name & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(24, 24, 27);
  doc.text('SHIFTIFY PACKERS & MOVERS', 14, (y += 8));

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122);
  doc.text('Professional Relocation, Packaging & Logistics Solutions', 14, (y += 5));
  doc.text(`Phone: ${COMPANY_INFO.phone}  |  Email: ${COMPANY_INFO.email}  |  Web: ${COMPANY_INFO.website}`, 14, (y += 4.5));
  doc.text('GSTIN: 29AAAAA0000A1Z5  |  Bangalore, Karnataka - 560102', 14, (y += 4.5));

  // Document Title Banner (Right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text('TAX INVOICE', pageWidth - 14, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice #: ${invoice.invoiceId}`, pageWidth - 14, 28, { align: 'right' });
  doc.text(`Invoice Date: ${invoice.invoiceDate}`, pageWidth - 14, 33, { align: 'right' });
  if (invoice.dueDate) {
    doc.text(`Due Date: ${invoice.dueDate}`, pageWidth - 14, 38, { align: 'right' });
  }
  if (invoice.quotationId) {
    doc.text(`Ref Quote #: ${invoice.quotationId}`, pageWidth - 14, 43, { align: 'right' });
  }

  // Divider Line
  y += 6;
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);

  // Billed To / Relocation Details Box
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'S');

  // Customer column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('BILLED TO (CUSTOMER):', 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text(invoice.customerName, 18, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: +91 ${invoice.phone}`, 18, y + 17);
  if (invoice.email) {
    doc.text(`Email: ${invoice.email}`, 18, y + 22);
  }

  // Moving Route column
  const midX = 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('RELOCATION PARTICULARS:', midX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Moving Type: ${invoice.movingType}`, midX, y + 11);
  doc.text(`Moving Date: ${invoice.movingDate}`, midX, y + 16);
  doc.text(`Pickup: ${invoice.fromLocation}`, midX, y + 21);
  doc.text(`Destination: ${invoice.toLocation}`, midX, y + 26);

  // Table
  y += 34;
  const tableData = invoice.items.map((item, idx) => [
    idx + 1,
    item.description,
    item.quantity,
    formatINR(item.unitPrice),
    formatINR(item.total ?? item.amount ?? (Number(item.quantity) * Number(item.unitPrice))),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item Description', 'Qty', 'Unit Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 32 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;
  const summaryBoxWidth = 85;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let currentY = finalY;

  // Subtotal
  doc.text('Subtotal:', summaryBoxX, currentY);
  doc.text(formatINR(invoice.subtotal), pageWidth - 14, currentY, { align: 'right' });

  if (invoice.discount > 0) {
    currentY += 5;
    doc.text('Discount:', summaryBoxX, currentY);
    doc.text(`- ${formatINR(invoice.discount)}`, pageWidth - 14, currentY, { align: 'right' });

    currentY += 5;
    doc.text('Taxable Amount:', summaryBoxX, currentY);
    doc.text(formatINR(invoice.taxableAmount), pageWidth - 14, currentY, { align: 'right' });
  }

  if (invoice.gstAmount > 0) {
    currentY += 5;
    doc.text(`GST (${invoice.gstPercentage}%):`, summaryBoxX, currentY);
    doc.text(formatINR(invoice.gstAmount), pageWidth - 14, currentY, { align: 'right' });
  }

  currentY += 6;
  doc.setFillColor(240, 253, 244); // Green-50
  doc.rect(summaryBoxX - 2, currentY - 4, summaryBoxWidth + 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129);
  doc.text('Grand Total:', summaryBoxX, currentY + 1.5);
  doc.text(formatINR(invoice.grandTotal), pageWidth - 14, currentY + 1.5, { align: 'right' });

  // Payment Status Details
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Amount Paid:', summaryBoxX, currentY);
  doc.text(formatINR(invoice.amountPaid), pageWidth - 14, currentY, { align: 'right' });

  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Balance Due:', summaryBoxX, currentY);
  doc.setTextColor(invoice.balanceDue > 0 ? 225 : 71, invoice.balanceDue > 0 ? 29 : 85, invoice.balanceDue > 0 ? 72 : 105);
  doc.text(formatINR(invoice.balanceDue), pageWidth - 14, currentY, { align: 'right' });

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Status:', summaryBoxX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.paymentStatus, pageWidth - 14, currentY, { align: 'right' });

  // Bank / Payment Details Box (Left aligned)
  let bankY = finalY;
  const bankWidth = summaryBoxX - 20;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, bankY, bankWidth, 24, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, bankY, bankWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment Options / Bank Details:', 18, bankY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Account Name: Shiftify Logistics India Private Limited', 18, bankY + 10);
  doc.text('Bank: HDFC Bank  |  Account No: 50200012345678', 18, bankY + 14);
  doc.text('IFSC: HDFC0001234  |  UPI ID: shiftify@hdfcbank', 18, bankY + 18);

  // Terms & Notes
  let notesY = bankY + 28;
  const termsText =
    invoice.terms ||
    '1. Goods received in good condition.\n2. Discrepancies if any must be notified within 24 hours of delivery.\n3. All disputes subject to Bangalore jurisdiction.';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Terms & Conditions:', 14, notesY);
  notesY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const splitTerms = doc.splitTextToSize(termsText, bankWidth);
  doc.text(splitTerms, 14, notesY);

  // Footer / Signatory
  const footerY = Math.max(currentY + 20, notesY + 15, 260);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for choosing Shiftify Packers & Movers! For support call +91 98765 43210.', 14, footerY + 5);
  doc.text('Authorized Signatory', pageWidth - 14, footerY + 5, { align: 'right' });

  doc.save(`${invoice.invoiceId}_Shiftify_Invoice.pdf`);
}
