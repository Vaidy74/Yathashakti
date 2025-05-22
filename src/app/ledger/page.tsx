"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import TransactionTable from "@/components/ledger/TransactionTable";
import CategoryManagement from "@/components/ledger/CategoryManagement";
import ExportButtons from "@/components/transactions/ExportButtons";
import { 
  BookOpen, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FilePlus,
  Loader2,
  AlertCircle,
  Tags
} from "lucide-react";
import { 
  TransactionWithRelations, 
  FinancialSummary, 
  TransactionType 
} from "@/types/transaction";

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/transactions');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setTransactions(data.data || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  // Fetch financial summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoadingSummary(true);
        const response = await fetch('/api/transactions/summary');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setFinancialSummary(data);
      } catch (err) {
        console.error('Error fetching summary:', err);
        // We don't set the main error state here to avoid blocking the whole page
      } finally {
        setIsLoadingSummary(false);
      }
    };
    
    fetchSummary();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4 md:mb-0">
            <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
            Financial Ledger
          </h1>

          <div className="flex space-x-3">
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setShowCategoryManagement(true)}
            >
              <Tags className="h-4 w-4 mr-2" />
              Manage Categories
            </button>
            
            <ExportButtons 
              transactions={transactions} 
              title="Financial Ledger" 
              className="inline-block"
            />

            <Link href="/transactions/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Transaction
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        {!isLoadingSummary && financialSummary && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-6">
            {/* Income card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <ArrowDownLeft className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(financialSummary.income)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <ArrowUpRight className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(financialSummary.expenses)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <FilePlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Current Balance</dt>
                      <dd className="flex items-baseline">
                        <div className={`text-2xl font-semibold ${financialSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(financialSummary.balance)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state for summary data */}
        {!isLoadingSummary && !financialSummary && !error && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
            <FilePlus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No financial data yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first transaction to see financial summary.</p>
          </div>
        )}
        
        {/* Transactions */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          ) : (
            <TransactionTable transactions={transactions} />
          )}
        </div>

        {/* Category Management Modal */}
        {showCategoryManagement && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <CategoryManagement onClose={() => setShowCategoryManagement(false)} />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && isLoadingSummary && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading financial data...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
