import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction, TransactionType } from '@/types/transaction';

/**
 * Generate a PDF file from transaction data with enhanced formatting
 * @param transactions Array of transactions to include in the PDF
 * @param title Title for the PDF document
 * @returns Blob containing the PDF data
 */
export const generateTransactionPDF = (transactions: Transaction[], title: string = 'Transaction Report'): Blob => {
  // Initialize PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add branded header
  const primaryColor = [41, 128, 185]; // Blue color for branding
  
  // Add header rectangle
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo (simulated with text for now)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('YATHASHAKTI', 14, 20);
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 30);
  
  // Add report information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 50);
  doc.text(`Total Transactions: ${transactions.length}`, 14, 56);
  
  // Calculate financial summary
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const income = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const expenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  // Add financial summary
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 62, 180, 25, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 18, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Income: ₹${income.toLocaleString('en-IN')}`, 18, 77);
  doc.text(`Total Expenses: ₹${expenses.toLocaleString('en-IN')}`, 100, 77);
  doc.text(`Net Amount: ₹${totalAmount.toLocaleString('en-IN')}`, 18, 84);
  
  // Format the data for the table
  const tableData = transactions.map(transaction => [
    transaction.date ? new Date(transaction.date).toLocaleDateString() : '',
    transaction.type || '',
    transaction.reference || '',
    transaction.description || '',
    transaction.category || '',
    transaction.amount ? `₹${transaction.amount.toLocaleString('en-IN')}` : '',
  ]);
  
  // Generate the table
  (doc as any).autoTable({
    head: [['Date', 'Type', 'Payee', 'Description', 'Category', 'Amount']],
    body: tableData,
    startY: 95,
    margin: { top: 95 },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 20 }, // Type
      5: { cellWidth: 25, halign: 'right' } // Amount
    },
    didDrawPage: function(data: any) {
      // Add footer to each page
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Yathashakti Financial Report | Page ${data.pageNumber} of ${data.pageCount}`, pageWidth / 2, footerY, { align: 'center' });
    }
  });
  
  // Generate PDF as blob
  const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  return blob;
};

/**
 * Generate an Excel file from transaction data
 * @param transactions Array of transactions to include in the Excel file
 * @param title Title for the Excel sheet
 * @returns Blob containing the Excel data
 */
export const generateTransactionExcel = (transactions: Transaction[], title: string = 'Transaction Report'): Blob => {
  // Format the data for Excel
  const excelData = transactions.map(transaction => ({
    ID: transaction.id,
    Date: transaction.date ? new Date(transaction.date).toLocaleDateString() : '',
    Amount: transaction.amount ? transaction.amount : '',
    Reference: transaction.reference || '',
    Description: transaction.description || '',
    Category: transaction.category || '',
    Type: transaction.type || '',
    Status: transaction.status || ''
  }));
  
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, title);
  
  // Generate Excel as blob
  const binaryString = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  
  // Convert binary string to blob
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i) & 0xff;
  }
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return blob;
};

/**
 * Download a blob as a file
 * @param blob The blob to download
 * @param fileName Name for the downloaded file
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  // Create a blob URL
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};
