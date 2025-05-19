"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Plus, Search, ExternalLink, AlertCircle, Upload, Loader2 } from "lucide-react";
import { Grantee, PaginationInfo } from "@/types/grantee";


export default function GranteesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sector, setSector] = useState("");
  const [grantees, setGrantees] = useState<Grantee[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, offset: 0, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get grantees from API
  useEffect(() => {
    async function fetchGrantees() {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (sector) params.append('sector', sector);

        const response = await fetch(`/api/grantees?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setGrantees(data.grantees);
        setPagination(data.pagination);
        setError("");
      } catch (err) {
        console.error("Failed to fetch grantees:", err);
        setError("Failed to load grantees. Please try again.");
        setGrantees([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGrantees();
  }, [searchTerm, sector]);

  // Get unique sectors for filter
  const sectors = Array.from(new Set(grantees.map(grantee => grantee.sector).filter(Boolean) as string[]));

  const handleSectorFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(searchTerm, e.target.value);
    setSector(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFilters(e.target.value, sector);
    setSearchTerm(e.target.value);
  };

  // Apply all filters
  const applyFilters = (search: string, sector: string) => {
    let result = grantees;

    // Apply search filter
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (grantee) =>
          grantee.name.toLowerCase().includes(searchLower) ||
          (grantee.location?.toLowerCase() || '').includes(searchLower) ||
          (grantee.sector?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Apply sector filter
    if (sector !== "") {
      result = result.filter((grantee) => grantee.sector && grantee.sector === sector);
    }

    setGrantees(result);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-500" />
              Grantees
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all recipients of interest-free revolving grants
            </p>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <Link
              href="/grantees/bulk-onboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Onboard
            </Link>
            <Link
              href="/grantees/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Grantee
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
                  placeholder="Search grantees..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Sector filter */}
              <div className="w-full md:w-auto">
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={sector}
                  onChange={handleSectorFilterChange}
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="px-6 py-24 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading grantees...</h3>
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            ) : grantees.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Sector
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
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
                  {grantees.map((grantee) => (
                    <tr key={grantee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{grantee.name}</div>
                        <div className="text-xs text-gray-500">ID: G-{grantee.id.padStart(3, "0")}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{grantee.sector}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{grantee.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/grantees/${grantee.id}`}
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No grantees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find grantees, or add a new grantee.
                </p>
                {!searchTerm && !sector && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <Link
                      href="/grantees/bulk-onboard"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Bulk Onboard
                    </Link>
                    <Link
                      href="/grantees/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Grantee
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
                Grantees are individuals or groups who receive interest-free, morally repayable grants through your programs. 
                You can track their progress and manage their grant-related data here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
