"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { ChevronLeft, CreditCard, Edit, Printer, AlertCircle, DollarSign, MessageSquare } from "lucide-react";
import GrantDetailTabs from "@/components/grants/GrantDetailTabs";
import { Grant, GrantStatus } from "@/types/grant";

interface PageProps {
  params: {
    id: string;
  };
}

export default function GrantDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [grant, setGrant] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Real API function to fetch grant data
  const fetchGrantData = async (id: string): Promise<Grant> => {
    try {
      const response = await fetch(`/api/grants/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      const grantData = await response.json();
      return grantData;
    } catch (error) {
      console.error("Error fetching grant data:", error);
      throw error;
    }
  };

  // Fetch grant data on component mount
  useEffect(() => {
    const loadGrantData = async () => {
      try {
        setLoading(true);
        const grantData = await fetchGrantData(params.id);
        setGrant(grantData);
        setError(null);
      } catch (err) {
        setError("Failed to load grant data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadGrantData();
  }, [params.id]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Render loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500">Loading grant details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => router.push('/grants')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Grants
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render grant details
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link 
              href="/grants" 
              className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Grants
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-blue-500" />
              Grant: {grant.grantIdentifier}
            </h1>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            {/* Add Record Repayment button */}
            {grant.status !== GrantStatus.COMPLETED && (
              <button 
                onClick={() => router.push(`/grants/${params.id}/record-repayment`)} 
                className="inline-flex items-center px-4 py-2 border border-green-500 shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Record Repayment
              </button>
            )}
            {/* Add Log Communication button */}
            <button 
              onClick={() => router.push(`/grants/${params.id}/log-communication`)} 
              className="inline-flex items-center px-4 py-2 border border-purple-500 shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Log Communication
            </button>
            <button 
              onClick={() => router.push(`/grants/${params.id}/edit`)} 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Grant
            </button>
          </div>
        </div>
        
        {/* Status Banner */}
        <div className={`mb-6 rounded-md p-4 flex items-center ${
          grant.status === GrantStatus.CURRENT
            ? "bg-green-50 border border-green-200 text-green-700"
            : grant.status === GrantStatus.PENDING
            ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
            : grant.status === GrantStatus.COMPLETED
            ? "bg-blue-50 border border-blue-200 text-blue-700"
            : grant.status === GrantStatus.DISBURSED
            ? "bg-teal-50 border border-teal-200 text-teal-700"
            : grant.status === GrantStatus.DEFAULTED
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-gray-50 border border-gray-200 text-gray-700"
        }`}>
          <div className="flex-1">
            <h3 className="text-sm font-medium">
              Status: {grant.status}
            </h3>
            <p className="text-sm mt-1">
              {grant.status === GrantStatus.CURRENT 
                ? "This grant is currently active with ongoing repayments." 
                : grant.status === GrantStatus.PENDING
                ? "This grant is approved but funds have not been disbursed yet."
                : grant.status === GrantStatus.DISBURSED
                ? "Funds have been disbursed but repayments have not started yet."
                : grant.status === GrantStatus.COMPLETED
                ? "This grant has been fully repaid and completed."
                : grant.status === GrantStatus.DEFAULTED
                ? "This grant has defaulted payments."
                : "Grant status information"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{formatCurrency(grant.amount)}</div>
            <div className="text-xs mt-1">Total Grant Amount</div>
          </div>
        </div>
        
        {/* Grant Tabs */}
        <GrantDetailTabs grant={grant} />
      </div>
    </DashboardLayout>
  );
}
