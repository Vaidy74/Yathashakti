"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Briefcase, Plus, Search, ExternalLink, AlertCircle } from "lucide-react";

// Mock program data (in a real app, this would come from an API)
const MOCK_PROGRAMS = [
  {
    id: "1",
    name: "Rural Entrepreneurship Initiative",
    status: "LIVE",
    category: "Entrepreneurship",
    startDate: "2025-01-15",
    budget: 3500000,
  },
  {
    id: "2",
    name: "Women Empowerment Program",
    status: "LIVE",
    category: "Skilling",
    startDate: "2025-02-01",
    budget: 2500000,
  },
  {
    id: "3",
    name: "Education for All",
    status: "PLANNING",
    category: "Education",
    startDate: "2025-04-01",
    budget: 4000000,
  },
  {
    id: "4",
    name: "Digital Literacy Program",
    status: "PLANNING",
    category: "Education",
    startDate: "2025-05-15",
    budget: 1500000,
  },
  {
    id: "5",
    name: "Healthcare Initiative",
    status: "ON_HOLD",
    category: "Healthcare",
    startDate: "2025-03-01",
    budget: 3000000,
  },
  {
    id: "6",
    name: "Sustainable Agriculture Project",
    status: "CLOSED",
    category: "Agriculture",
    startDate: "2024-10-01",
    budget: 2000000,
  }
];

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [filteredPrograms, setFilteredPrograms] = useState(MOCK_PROGRAMS);

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set(MOCK_PROGRAMS.map((program) => program.category))
  );

  // Handle search and filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFilters(e.target.value, statusFilter, categoryFilter);
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(searchQuery, e.target.value, categoryFilter);
    setStatusFilter(e.target.value);
  };

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(searchQuery, statusFilter, e.target.value);
    setCategoryFilter(e.target.value);
  };

  // Apply all filters
  const applyFilters = (search: string, status: string, category: string) => {
    let result = MOCK_PROGRAMS;

    // Apply search filter
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter(
        (program) =>
          program.name.toLowerCase().includes(query) ||
          program.category.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (status !== "") {
      result = result.filter((program) => program.status === status);
    }

    // Apply category filter
    if (category !== "") {
      result = result.filter((program) => program.category === category);
    }

    setFilteredPrograms(result);
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
      case "LIVE":
        return "bg-green-100 text-green-800";
      case "PLANNING":
        return "bg-blue-100 text-blue-800";
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get formatted status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "LIVE":
        return "Live";
      case "PLANNING":
        return "Planning";
      case "ON_HOLD":
        return "On Hold";
      case "CLOSED":
        return "Closed";
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
              <Briefcase className="h-6 w-6 mr-2 text-blue-500" />
              Programs
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all grant programs and initiatives
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/programs/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Program
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
                  placeholder="Search programs..."
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
                  <option value="PLANNING">Planning</option>
                  <option value="LIVE">Live</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              {/* Category filter */}
              <div className="w-full md:w-auto">
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredPrograms.length > 0 ? (
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
                      Program ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Program Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Start Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Program Budget
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
                  {filteredPrograms.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            program.status
                          )}`}
                        >
                          {getStatusLabel(program.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">P-{program.id.padStart(3, "0")}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{program.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{program.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(program.startDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatCurrency(program.budget)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/programs/${program.id}`}
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
                <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No programs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter || categoryFilter
                    ? "Try a different search or filter."
                    : "Get started by adding a new program."}
                </p>
                {!searchQuery && !statusFilter && !categoryFilter && (
                  <div className="mt-6">
                    <Link
                      href="/programs/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Program
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
                You can filter programs by status and category. Live programs are currently active and disbursing grants,
                while planning programs are still in the setup phase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
