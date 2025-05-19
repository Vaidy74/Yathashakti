"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import TransactionTable from "@/components/ledger/TransactionTable";
import { 
  BookOpen, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download,
  FilePlus
} from "lucide-react";

// Mock transaction data
const mockTransactions = [
  {
    id: "tx1",
    date: "2025-05-15",
    description: "Grant Disbursement - Amit Kumar",
    type: "expense" as const,
    category: "Grant",
    amount: 15000,
    paymentMethod: "Bank Transfer",
    reference: "GRANT-001",
    status: "completed" as const
  },
  {
    id: "tx2",
    date: "2025-05-10",
    description: "Donor Contribution - Tech Corp Foundation",
    type: "income" as const,
    category: "Donation",
    amount: 100000,
    paymentMethod: "Bank Transfer",
    reference: "DON-2025-005",
    status: "completed" as const
  },
  {
    id: "tx3",
    date: "2025-05-08",
    description: "Grant Repayment - Priya Sharma",
    type: "income" as const,
    category: "Repayment",
    amount: 5000,
    paymentMethod: "Cash",
    reference: "GRANT-003-R1",
    status: "completed" as const
  },
  {
    id: "tx4",
    date: "2025-05-05",
    description: "Training Workshop - FinSkill Academy",
    type: "expense" as const,
    category: "Service Provider",
    amount: 25000,
    paymentMethod: "Bank Transfer",
    reference: "SP-INV-102",
    status: "completed" as const
  },
  {
    id: "tx5",
    date: "2025-04-28",
    description: "Grant Disbursement - Vijay Patel",
    type: "expense" as const,
    category: "Grant",
    amount: 20000,
    paymentMethod: "Bank Transfer",
    reference: "GRANT-002",
    status: "completed" as const
  }
];

export default function LedgerPage() {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate summary stats
  const calculateSummary = () => {
    const income = mockTransactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expenses = mockTransactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  const summary = calculateSummary();

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-blue-500" />
            Financial Ledger
          </h1>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="flex space-x-1">
              <Link
                href="/ledger/income/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Add Income
              </Link>
              <Link
                href="/ledger/expense/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Add Expense
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <ArrowUpRight className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.income)}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <ArrowDownLeft className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.expenses)}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Current Balance</dt>
                  <dd className="flex items-baseline">
                    <div className={`text-2xl font-semibold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(summary.balance)}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Recent Transactions
            </h3>
            <Link
              href="/ledger/transactions"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <TransactionTable transactions={mockTransactions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
