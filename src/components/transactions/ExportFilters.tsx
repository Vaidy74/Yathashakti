import React, { useState } from 'react';
import { Transaction } from '@/types/transaction';

interface ExportFiltersProps {
  transactions: Transaction[];
  onApplyFilters: (filteredTransactions: Transaction[]) => void;
  className?: string;
}

/**
 * Component that provides filtering options for transaction exports
 */
const ExportFilters: React.FC<ExportFiltersProps> = ({ 
  transactions, 
  onApplyFilters,
  className = '' 
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Get unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
  
  // Apply filters to transactions
  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Apply date range filter
    if (startDate) {
      const startDateTime = new Date(startDate).getTime();
      filtered = filtered.filter(t => 
        t.date && new Date(t.date).getTime() >= startDateTime
      );
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate).getTime() + (24 * 60 * 60 * 1000); // Include the end date
      filtered = filtered.filter(t => 
        t.date && new Date(t.date).getTime() <= endDateTime
      );
    }
    
    // Apply category filter
    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }
    
    onApplyFilters(filtered);
  };
  
  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setCategory('');
    onApplyFilters(transactions);
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className="text-blue-600 underline text-sm mb-2 hover:text-blue-800"
      >
        {showFilters ? 'Hide Export Filters' : 'Show Export Filters'}
      </button>
      
      {showFilters && (
        <div className="p-4 border rounded-md bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportFilters;
