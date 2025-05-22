"use client";

import { useEffect, useState } from "react";
import { ServiceProviderPerformance } from "@/types/service-provider";
import { Loader2, TrendingUp, AlertCircle, CheckCircle, BarChart, Calendar } from "lucide-react";
import Link from "next/link";

interface ServiceProviderPerformanceProps {
  serviceProviderId: string;
}

const PerformanceMetrics = ({ serviceProviderId }: ServiceProviderPerformanceProps) => {
  const [performance, setPerformance] = useState<ServiceProviderPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/service-providers/${serviceProviderId}/performance`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPerformance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch performance metrics");
        console.error("Error fetching performance metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceProviderId) {
      fetchPerformanceData();
    }
  }, [serviceProviderId]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading performance metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center text-red-500 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <h3 className="text-lg font-medium">Error Loading Performance Data</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-gray-500 text-sm">
          This may occur if the service provider has no associated grants or programs. 
          Performance metrics are based on grant and program activity.
        </p>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center text-yellow-500 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <h3 className="text-lg font-medium">No Performance Data Available</h3>
        </div>
        <p className="text-gray-600">
          This service provider has no available performance metrics yet. Performance data is generated
          from grant and program activity.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 Cr+
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1L+
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) { // 1K+
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${amount.toFixed(0)}`;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRepaymentRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-500";
    if (rate >= 80) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
          Performance Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Grants Performance */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Grants Performance</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total Grants</span>
              <span className="font-medium">{performance.overview.totalGrants}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Active Grants</span>
              <span className="font-medium text-blue-600">{performance.overview.activeGrants}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Completed Grants</span>
              <span className="font-medium text-green-600">{performance.overview.completedGrants}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="text-sm font-medium text-gray-600">Total Amount</span>
              <span className="font-medium text-gray-900">{formatCurrency(performance.overview.totalGrantAmount)}</span>
            </div>
          </div>
          
          {/* Repayment Performance */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Repayment Performance</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Expected</span>
              <span className="font-medium">{formatCurrency(performance.repaymentPerformance.totalRepaymentExpected)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Received</span>
              <span className="font-medium">{formatCurrency(performance.repaymentPerformance.totalRepaymentReceived)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Overdue Installments</span>
              <span className={`font-medium ${performance.repaymentPerformance.overdueInstallments > 0 ? "text-red-500" : "text-gray-600"}`}>
                {performance.repaymentPerformance.overdueInstallments}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="text-sm font-medium text-gray-600">Repayment Rate</span>
              <span className={`font-medium text-lg ${getRepaymentRateColor(performance.repaymentPerformance.repaymentRate)}`}>
                {performance.repaymentPerformance.repaymentRate.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Recent Activity (30 days)</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">New Grants</span>
              <span className="font-medium">{performance.recentActivity.recentGrants}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Communications</span>
              <span className="font-medium">{performance.recentActivity.recentCommunications}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Last Active</span>
              <span className="font-medium">
                {performance.recentActivity.lastActive 
                  ? formatDate(performance.recentActivity.lastActive) 
                  : "Never"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="text-sm font-medium text-gray-600">Programs Active</span>
              <span className="font-medium">
                {performance.overview.activeProgramsCount} / {performance.overview.uniqueProgramsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Repayment Rate Visual Indicator */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Repayment Rate</h4>
          <div className="bg-gray-200 h-4 w-full rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                performance.repaymentPerformance.repaymentRate >= 95 
                  ? "bg-green-500" 
                  : performance.repaymentPerformance.repaymentRate >= 80 
                    ? "bg-yellow-500" 
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, performance.repaymentPerformance.repaymentRate)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Program-specific Performance */}
      {performance.programPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart className="w-5 h-5 text-blue-500 mr-2" />
            Program-specific Performance
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grants
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performance.programPerformance.map((program) => (
                  <tr key={program.programId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {program.programName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.grantsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {program.activeGrants}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {program.completedGrants}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(program.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link 
                        href={`/programs/${program.programId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Program
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;
