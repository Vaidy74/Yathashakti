"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GrantStatus } from "@/types/grant";
import DashboardLayout from "@/components/DashboardLayout";
import { CreditCard, Search, Plus, Filter, ChevronDown, Calendar, ChevronsUpDown, Download, ArrowUpRight, AlertCircle } from "lucide-react";

// Mock grant data for initial state before API data loads
// Initial grants for fallback if API fails
interface Program {
  id: string;
  name: string;
}

const programs: Program[] = [
  { id: "1", name: "Rural Entrepreneurship" },
  { id: "2", name: "Urban Empowerment" },
  { id: "3", name: "Agricultural Development" },
  { id: "4", name: "Clean Energy" },
  { id: "5", name: "Micro Manufacturing" },
];

interface GrantDisplay {
  id: string;
  grantIdentifier: string;
  amount: number;
  granteeName: string;
  programId: string;
  programName: string;
  disbursementDate: string;
  status: GrantStatus;
  repaymentStatus: string;
  repaid: number;
  nextPaymentDue: string | null;
}

const INITIAL_GRANTS: GrantDisplay[] = [
  {
    id: "1",
    grantIdentifier: "GRT-2025-001",
    amount: 50000,
    granteeName: "Rajesh Kumar",
    programId: "1",
    programName: "Rural Entrepreneurship",
    disbursementDate: "2025-01-15",
    status: GrantStatus.CURRENT,
    repaymentStatus: "On Schedule",
    repaid: 15000,
    nextPaymentDue: "2025-03-15",
  },
  {
    id: "2",
    grantIdentifier: "GRT-2025-002",
    amount: 35000,
    granteeName: "Meera Devi",
    programId: "2",
    programName: "Urban Empowerment",
    disbursementDate: "2025-01-20",
    status: GrantStatus.CURRENT,
    repaymentStatus: "On Schedule",
    repaid: 10000,
    nextPaymentDue: "2025-03-20",
  },
  {
    id: "3",
    grantIdentifier: "GRT-2025-003",
    amount: 45000,
    granteeName: "Suresh Yadav",
    programId: "1",
    programName: "Rural Entrepreneurship",
    disbursementDate: "2025-02-01",
    status: GrantStatus.PENDING,
    repaymentStatus: "Not Started",
    repaid: 0,
    nextPaymentDue: null,
  },
  {
    id: "4",
    grantIdentifier: "GRT-2025-004",
    amount: 25000,
    granteeName: "Priya Sharma",
    programId: "2",
    programName: "Urban Empowerment",
    disbursementDate: "2025-02-05",
    status: GrantStatus.CURRENT,
    repaymentStatus: "Delayed",
    repaid: 5000,
    nextPaymentDue: "2025-03-05",
  },
  {
    id: "5",
    grantIdentifier: "GRT-2025-005",
    amount: 60000,
    granteeName: "Vikram Mehta",
    programId: "3",
    programName: "Agricultural Development",
    disbursementDate: "2025-01-10",
    status: GrantStatus.CURRENT,
    repaymentStatus: "On Schedule",
    repaid: 20000,
    nextPaymentDue: "2025-03-10",
  },
  {
    id: "6",
    grantIdentifier: "GRT-2024-056",
    amount: 30000,
    granteeName: "Anjali Gupta",
    programId: "4",
    programName: "Clean Energy",
    disbursementDate: "2024-12-15",
    status: GrantStatus.COMPLETED,
    repaymentStatus: "Fully Repaid",
    repaid: 30000,
    nextPaymentDue: null,
  }
];

// Get unique programs for filter dropdown
const UNIQUE_PROGRAMS = Array.from(new Set(INITIAL_GRANTS.map((grant) => grant.programName)));

// Status options for filter
const STATUS_OPTIONS = ["All", GrantStatus.CURRENT, GrantStatus.PENDING, GrantStatus.DISBURSED, GrantStatus.COMPLETED];
const REPAYMENT_STATUS_OPTIONS = ["All", "On Schedule", "Delayed", "Not Started", "Fully Repaid"];

export default function GrantsPage() {
  // Define state variables
  const [grants, setGrants] = useState<GrantDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalGrants, setTotalGrants] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [repaymentStatusFilter, setRepaymentStatusFilter] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  
  // Add useEffect to fetch data from the API
  const fetchGrants = async () => {
    try {
      setIsLoading(true);
      const offset = (currentPage - 1) * limit;
      
      // Construct the query parameters
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }
      
      if (selectedProgram) {
        params.append('programId', selectedProgram);
      }
      
      // Fetch data from the API
      const response = await fetch(`/api/grants?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching grants: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setGrants(data.grants);
      setTotalGrants(data.total);
    } catch (error) {
      console.error("Error fetching grants:", error);
      // If API fails, use initial grants as fallback
      setGrants(INITIAL_GRANTS);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch grants when component mounts or when filters change
  useEffect(() => {
    fetchGrants();
  }, [currentPage, searchQuery, selectedStatus, selectedProgram]);

  // Handle search and filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFilters(e.target.value, programFilter, statusFilter, repaymentStatusFilter);
    setSearchQuery(e.target.value);
  };

  const handleProgramFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(searchQuery, e.target.value, statusFilter, repaymentStatusFilter);
    setProgramFilter(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(searchQuery, programFilter, e.target.value, repaymentStatusFilter);
    setStatusFilter(e.target.value);
  };

  const handleRepaymentStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(searchQuery, programFilter, statusFilter, e.target.value);
    setRepaymentStatusFilter(e.target.value);
  };

  // Apply all filters
  const applyFilters = (search: string, program: string, status: string, repaymentStatus: string) => {
    let result = [...grants];

    // Apply search filter
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter(
        (grant) =>
          grant.granteeName.toLowerCase().includes(query) ||
          grant.grantIdentifier.toLowerCase().includes(query) ||
          grant.programName.toLowerCase().includes(query)
      );
    }

    // Apply program filter
    if (program !== "") {
      result = result.filter((grant) => grant.programId === program);
    }

    // Apply status filter
    if (status !== "All") {
      result = result.filter((grant) => grant.status === status);
    }

    // Apply repayment status filter
    if (repaymentStatus !== "All") {
      result = result.filter((grant) => grant.repaymentStatus === repaymentStatus);
    }

    return result;
  };

  const filteredGrants = applyFilters(searchQuery, programFilter, statusFilter, repaymentStatusFilter);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate repayment progress percentage
  const calculateProgress = (repaid: number, total: number) => {
    return (repaid / total) * 100;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-blue-500" />
              Grants Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and track grants throughout their lifecycle
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/grants/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Grant
            </Link>
            <Link
              href="/grants/reports"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Reports
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search grants by ID or grantee"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Program Filter */}
            <div>
              <label htmlFor="program-filter" className="sr-only">
                Filter by Program
              </label>
              <div className="relative rounded-md shadow-sm">
                <select
                  id="program-filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={programFilter}
                  onChange={handleProgramFilterChange}
                >
                  <option value="">All Programs</option>
                  {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Filter by Status
              </label>
              <div className="relative rounded-md shadow-sm">
                <select
                  id="status-filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Repayment Status Filter */}
            <div>
              <label htmlFor="repayment-status-filter" className="sr-only">
                Filter by Repayment Status
              </label>
              <div className="relative rounded-md shadow-sm">
                <select
                  id="repayment-status-filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={repaymentStatusFilter}
                  onChange={handleRepaymentStatusFilterChange}
                >
                  {REPAYMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grants List */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {filteredGrants.length === 0 && grants.length > 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No grants found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grant ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grantee
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repayment
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Payment
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrants.map((grant: any) => (
                    <tr key={grant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grant.grantIdentifier}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grant.granteeName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grant.program}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(grant.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            grant.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : grant.status === "Pending Disbursement"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {grant.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-medium ${
                                grant.repaymentStatus === "On Schedule"
                                  ? "text-green-700"
                                  : grant.repaymentStatus === "Delayed"
                                  ? "text-red-700"
                                  : grant.repaymentStatus === "Fully Repaid"
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {grant.repaymentStatus}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCurrency(grant.repaid)} of {formatCurrency(grant.amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                grant.repaymentStatus === "On Schedule"
                                  ? "bg-green-500"
                                  : grant.repaymentStatus === "Delayed"
                                  ? "bg-red-500"
                                  : grant.repaymentStatus === "Fully Repaid"
                                  ? "bg-blue-500"
                                  : "bg-gray-500"
                              }`}
                              style={{ width: `${calculateProgress(grant.repaid, grant.amount)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {grant.nextPaymentDue ? (
                            <>
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              {formatDate(grant.nextPaymentDue)}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/grants/${grant.id}`}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          View
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
