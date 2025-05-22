import React, { useState } from 'react';
import { FileDown, Filter } from 'lucide-react';
import ExportFilters from './ExportFilters';
import { Transaction } from '@/types/transaction';
import { generateTransactionPDF, generateTransactionExcel, downloadBlob } from '@/utils/exports/exportUtils';

interface ExportButtonsProps {
  transactions: Transaction[];
  title?: string;
  className?: string;
}

/**
 * Component that renders export buttons for transaction data
 */
const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  transactions, 
  title = 'Transaction Report', 
  className = '' 
}) => {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
  // Generate and download PDF
  const handleExportPDF = () => {
    try {
      const pdfBlob = generateTransactionPDF(filteredTransactions, title);
      const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadBlob(pdfBlob, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Generate and download Excel
  const handleExportExcel = () => {
    try {
      const excelBlob = generateTransactionExcel(filteredTransactions, title);
      const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(excelBlob, fileName);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };
  
  // Update filtered transactions when base transactions change
  React.useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  return (
    <div className={className}>
      {showFilterOptions && (
        <ExportFilters 
          transactions={transactions} 
          onApplyFilters={setFilteredTransactions} 
          className="mb-4"
        />
      )}
      
      <div className="flex space-x-2">
        <button 
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowFilterOptions(!showFilterOptions)}
          disabled={transactions.length === 0}
          title="Filter Exports"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </button>
        <button 
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExportPDF}
          disabled={filteredTransactions.length === 0}
          title="Export as PDF"
        >
          <FileDown className="h-4 w-4 mr-1" />
          PDF
        </button>
        <button 
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExportExcel}
          disabled={filteredTransactions.length === 0}
          title="Export as Excel"
        >
          <FileDown className="h-4 w-4 mr-1" />
          Excel
        </button>
      </div>
      
      {filteredTransactions.length !== transactions.length && (
        <div className="mt-2 text-sm text-gray-600">
          Exporting {filteredTransactions.length} of {transactions.length} transactions
        </div>
      )}
    </div>
  );
};

export default ExportButtons;
