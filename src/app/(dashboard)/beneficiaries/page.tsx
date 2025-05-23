"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Plus, Search, ExternalLink, AlertCircle } from "lucide-react";

// Mock beneficiary data (in a real app, this would come from an API)
const MOCK_BENEFICIARIES = [
  {
    id: "1",
    name: "Rajesh Kumar",
    program: "Rural Entrepreneurship Initiative",
    programId: "1",
    gender: "Male",
    village: "Chandpur",
    district: "Alwar",
    state: "Rajasthan",
    phone: "+91 98765 43210",
    venture: "Dairy Farm",
    status: "ACTIVE",
    joinDate: "2025-02-15",
    grantAmount: 25000,
    repaid: 10000,
  },
  {
    id: "2",
    name: "Meera Devi",
    program: "Women Empowerment Program",
    programId: "2",
    gender: "Female",
    village: "Bansur",
    district: "Alwar",
    state: "Rajasthan",
    phone: "+91 87654 32109",
    venture: "Handicrafts",
    status: "ACTIVE",
    joinDate: "2025-02-20",
    grantAmount: 20000,
    repaid: 5000,
  },
  {
    id: "3",
    name: "Ramesh Singh",
    program: "Rural Entrepreneurship Initiative",
    programId: "1",
    gender: "Male",
    village: "Behror",
    district: "Alwar",
    state: "Rajasthan",
    phone: "+91 76543 21098",
    venture: "Poultry Farm",
    status: "ACTIVE",
    joinDate: "2025-03-01",
    grantAmount: 30000,
    repaid: 7500,
  },
  {
    id: "4",
    name: "Lakshmi Sharma",
    program: "Women Empowerment Program",
    programId: "2",
    gender: "Female",
    village: "Khairthal",
    district: "Alwar",
    state: "Rajasthan",
    phone: "+91 65432 10987",
    venture: "Tailoring Shop",
    status: "COMPLETED",
    joinDate: "2025-01-15",
    grantAmount: 15000,
    repaid: 15000,
  },
  {
    id: "5",
    name: "Suresh Yadav",
    program: "Rural Entrepreneurship Initiative",
    programId: "1",
    gender: "Male",
    village: "Tijara",
    district: "Alwar",
    state: "Rajasthan",
    phone: "+91 54321 09876",
    venture: "Vegetable Farming",
    status: "ACTIVE",
    joinDate: "2025-03-10",
    grantAmount: 18000,
    repaid: 3000,
  },
  {
    id: "6",
    name: "Geeta Kumari",
    program: "Digital Literacy Program",
    programId: "4",
    gender: "Female",
    village: "Rajgarh",
    district: "Alwar",
    state: "Rajasthan",
    phone: "+91 43210 98765",
    venture: "Computer Training Center",
    status: "ACTIVE",
    joinDate: "2025-03-15",
    grantAmount: 35000,
    repaid: 5000,
  },
  {
    id: "7",
    name: "Mahesh Choudhary",
    program: "Rural Entrepreneurship Initiative",
    programId: "1",
    gender: "Male",
    village: "Kotkasim",
    district: "Alwar",
    state: "Rajasthan",
    phone: "+91 32109 87654",
    venture: "Organic Farming",
    status: "DEFAULTED",
    joinDate: "2025-02-01",
    grantAmount: 20000,
    repaid: 5000,
  },
  {
    id: "8",
    name: "Priya Gupta",
    program: "Women Empowerment Program",
    programId: "2",
    gender: "Female",
    village: "Laxmangarh",
    district: "Alwar",
    state: "Rajasthan",
    phone: "+91 21098 76543",
    venture: "Beauty Parlor",
    status: "ACTIVE",
    joinDate: "2025-03-20",
    grantAmount: 22000,
    repaid: 4000,
  }
];

export default function BeneficiariesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState(MOCK_BENEFICIARIES);

  // Get unique programs for filter dropdown
  const programs = Array.from(
    new Set(MOCK_BENEFICIARIES.map((beneficiary) => beneficiary.program))
  );

  // Handle search and filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFilters(e.target.value, statusFilter, programFilter);
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(searchQuery, e.target.value, programFilter);
    setStatusFilter(e.target.value);
  };

  const handleProgramFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(searchQuery, statusFilter, e.target.value);
    setProgramFilter(e.target.value);
  };

  // Apply all filters
  const applyFilters = (search: string, status: string, program: string) => {
    let result = MOCK_BENEFICIARIES;

    // Apply search filter
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter(
        (beneficiary) =>
          beneficiary.name.toLowerCase().includes(query) ||
          beneficiary.venture.toLowerCase().includes(query) ||
          beneficiary.village.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (status !== "") {
      result = result.filter((beneficiary) => beneficiary.status === status);
    }

    // Apply program filter
    if (program !== "") {
      result = result.filter((beneficiary) => beneficiary.program === program);
    }

    setFilteredBeneficiaries(result);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get color for status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "DEFAULTED":
        return "bg-red-100 text-red-800";
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get formatted status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "COMPLETED":
        return "Completed";
      case "DEFAULTED":
        return "Defaulted";
      case "ON_HOLD":
        return "On Hold";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-500" />
              Beneficiaries
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all program beneficiaries and their grant details
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/beneficiaries/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Beneficiary
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              {/* Search input */}
              <div className="relative max-w-xs w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search beneficiaries..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Status filter */}
              <div className="w-full md:w-auto">
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DEFAULTED">Defaulted</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>

              {/* Program filter */}
              <div className="w-full md:w-auto">
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={programFilter}
                  onChange={handleProgramFilterChange}
                >
                  <option value="">All Programs</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredBeneficiaries.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Beneficiary ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name & Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Venture
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Program
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Grant Details
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBeneficiaries.map((beneficiary) => (
                    <tr key={beneficiary.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            beneficiary.status
                          )}`}
                        >
                          {getStatusLabel(beneficiary.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">B-{beneficiary.id.padStart(3, "0")}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{beneficiary.name}</div>
                        <div className="text-sm text-gray-500">{beneficiary.phone}</div>
                        <div className="text-sm text-gray-500">{beneficiary.village}, {beneficiary.district}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{beneficiary.venture}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/programs/${beneficiary.programId}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {beneficiary.program}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <div>Grant: {formatCurrency(beneficiary.grantAmount)}</div>
                          <div>Repaid: {formatCurrency(beneficiary.repaid)}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(beneficiary.repaid / beneficiary.grantAmount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/beneficiaries/${beneficiary.id}`}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          View
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No beneficiaries found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter || programFilter
                    ? "Try a different search or filter."
                    : "Get started by adding a new beneficiary."}
                </p>
                {!searchQuery && !statusFilter && !programFilter && (
                  <div className="mt-6">
                    <Link
                      href="/beneficiaries/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Beneficiary
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Info Alert */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Beneficiaries are individuals or groups who receive revolving grants through your programs. 
                You can track their progress, manage grant disbursements, and record repayments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
