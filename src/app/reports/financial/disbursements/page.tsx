"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ReportFilters from "@/components/dashboard/reporting/ReportFilters";
import GrantMetricsChart from "@/components/dashboard/reporting/GrantMetricsChart";
import { BarChart3, FileText, Download, CreditCard, ChevronLeft, Filter, RefreshCw, Printer } from "lucide-react";

export default function DisbursementReportPage() {
  const [activeFilters, setActiveFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle filter application
  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setIsLoading(true);
    
    // Simulate API call to fetch filtered data
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Mock data for charts and tables
  const monthlyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    disbursed: [25000, 35000, 45000, 30000, 60000, 40000],
    repaid: [5000, 15000, 20000, 22000, 25000, 30000]
  };
  
  const programData = {
    labels: ["Rural Entrepreneurship", "Women Entrepreneurship", "Youth Skills", "Green Business"],
    disbursed: [85000, 65000, 45000, 30000],
    repaid: [35000, 25000, 15000, 10000]
  };

  // Mock table data - recent disbursements
  const recentDisbursements = [
    {
      id: "D1001",
      date: "2025-05-15",
      grantee: "Amit Kumar",
      program: "Rural Entrepreneurship",
      amount: 15000,
      purpose: "Dairy equipment purchase"
    },
    {
      id: "D1002",
      date: "2025-05-12",
      grantee: "Priya Sharma",
      program: "Women Entrepreneurship",
      amount: 20000,
      purpose: "Handicrafts business expansion"
    },
    {
      id: "D1003",
      date: "2025-05-10",
      grantee: "Rahul Singh",
      program: "Youth Skills",
      amount: 12000,
      purpose: "Mobile repair shop setup"
    },
    {
      id: "D1004",
      date: "2025-05-08",
      grantee: "Meera Patel",
      program: "Green Business",
      amount: 25000,
      purpose: "Organic farming inputs"
    },
    {
      id: "D1005",
      date: "2025-05-05",
      grantee: "Vijay Verma",
      program: "Rural Entrepreneurship",
      amount: 18000,
      purpose: "Poultry farm expansion"
    }
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate summary stats
  const calculateSummary = () => {
    const totalDisbursed = monthlyData.disbursed.reduce((a, b) => a + b, 0);
    const totalGrants = recentDisbursements.length;
    const avgGrantSize = totalDisbursed / totalGrants;
    
    return {
      totalDisbursed,
      totalGrants,
      avgGrantSize
    };
  };

  const summary = calculateSummary();

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/reports" 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <CreditCard className="h-6 w-6 mr-2 text-blue-500" />
            Grant Disbursement Report
          </h1>
        </div>

        <ReportFilters onApplyFilters={handleApplyFilters} />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="mt-2 text-gray-600">Loading report data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Report Actions */}
            <div className="flex justify-end mb-6 space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </button>
            </div>
            
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Disbursed</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalDisbursed)}</div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Number of Grants</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{summary.totalGrants}</div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Average Grant Size</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.avgGrantSize)}</div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <GrantMetricsChart 
                data={monthlyData} 
                title="Monthly Disbursement & Repayment"
                periodLabel="Month (2025)"
              />
              
              <GrantMetricsChart 
                data={programData} 
                title="Disbursement by Program"
                periodLabel="Program"
              />
            </div>
            
            {/* Recent Disbursements Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Recent Disbursements
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grantee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentDisbursements.map((disbursement) => (
                      <tr key={disbursement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {disbursement.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(disbursement.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {disbursement.grantee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {disbursement.program}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(disbursement.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {disbursement.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Additional Insights Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Report Insights
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="prose max-w-full">
                  <h4>Key Observations</h4>
                  <ul>
                    <li>Disbursements have consistently increased month over month, with the highest in May 2025.</li>
                    <li>Rural Entrepreneurship program represents the largest portion of disbursements at 38%.</li>
                    <li>Average grant size has increased by 15% compared to the previous reporting period.</li>
                    <li>Repayment rates are on track at approximately 42% of disbursed amounts.</li>
                  </ul>
                  
                  <h4 className="mt-4">Recommendations</h4>
                  <ul>
                    <li>Consider increasing allocation to the Green Business program which shows promising repayment rates.</li>
                    <li>Review application processes for the Youth Skills program to increase disbursement efficiency.</li>
                    <li>Set up monitoring for outlier grants over ₹20,000 to ensure proper utilization.</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
