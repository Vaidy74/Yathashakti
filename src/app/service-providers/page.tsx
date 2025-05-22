"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, Search, Filter, UserPlus, ArrowUpDown, 
  ChevronRight, Phone, MapPin, Building, Loader2
} from "lucide-react";
import { ServiceProvider, ServiceProviderWithRelations } from "@/types/service-provider";

interface ApiResponse {
  serviceProviders: ServiceProvider[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export default function ServiceProvidersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [serviceProviders, setServiceProviders] = useState<ServiceProviderWithRelations[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch service providers from API
  const fetchServiceProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/service-providers?page=${currentPage}&limit=${itemsPerPage}${searchTerm ? `&search=${searchTerm}` : ''}${filterCategory ? `&category=${filterCategory}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setServiceProviders(data.serviceProviders || []);
      setTotalItems(data.totalCount || 0);
      
      // Extract unique categories for the filter
      if (data.serviceProviders && data.serviceProviders.length > 0) {
        // Create a Set of categories and convert to array to avoid TS error
        const categorySet = new Set<string>();
        data.serviceProviders.forEach((provider: ServiceProvider) => {
          if (provider.category) {
            categorySet.add(provider.category);
          }
        });
        setCategories(Array.from(categorySet));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Failed to fetch service providers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, filterCategory, itemsPerPage]);
  
  // Fetch categories separately to populate filter dropdown
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/service-providers?limit=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data: ApiResponse = await response.json();
      const uniqueCategories = [...new Set(data.serviceProviders.map(sp => sp.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      // Silent fail for categories, not critical
      console.error('Failed to fetch categories:', err);
    }
  }, []);
  
  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchServiceProviders();
  }, [fetchServiceProviders]);
  
  // Fetch categories on initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle category filter change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-500" />
            Service Providers
          </h1>
          <Link
            href="/service-providers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Service Provider
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative rounded-md shadow-sm col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search service providers by name, contact, or location"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={filterCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading service providers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading service providers</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => fetchServiceProviders()}
                  className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Providers List */}
        {!isLoading && !error && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {serviceProviders.length > 0 ? (
                serviceProviders.map((provider: ServiceProvider) => (
                  <li key={provider.id}>
                    <Link
                      href={`/service-providers/${provider.id}`}
                      className="block hover:bg-gray-50 transition duration-150"
                    >
                      <div className="px-6 py-5 flex items-center">
                        <div className="min-w-0 flex-1 flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg">
                              {provider.name?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                            <div>
                              <p className="text-sm font-medium text-blue-600 truncate">{provider.name}</p>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span className="truncate">{provider.category}</span>
                              </div>
                            </div>
                            <div className="hidden md:block">
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span className="truncate">{provider.location || 'No location specified'}</span>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span className="truncate">
                                  {provider.contactPerson || 'No contact'} {provider.contactNumber ? `• ${provider.contactNumber}` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-5 flex flex-col items-end">
                            {/* Display active grants count */}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {(provider as ServiceProviderWithRelations).grants?.length || 0} Active
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-6 py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No service providers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <div className="mt-6">
                    <Link 
                      href="/service-providers/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Service Provider
                    </Link>
                  </div>
                </li>
              )}
            </ul>
            
            {/* Pagination */}
            {serviceProviders.length > 0 && totalPages > 1 && (
              <nav className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span> of <span className="font-medium">{totalItems}</span> service providers
                  </p>
                </div>
                <div className="flex-1 flex justify-center sm:justify-end">
                  <div className="relative z-0 inline-flex shadow-sm rounded-md">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === i + 1
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </nav>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
