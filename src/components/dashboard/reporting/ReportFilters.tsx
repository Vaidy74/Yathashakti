"use client";

import { useState } from "react";
import { 
  Calendar, 
  Filter, 
  Search,
  Tag,
  MapPin,
  ChevronsUpDown,
  X
} from "lucide-react";

interface ReportFiltersProps {
  onApplyFilters: (filters: any) => void;
}

export default function ReportFilters({ onApplyFilters }: ReportFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: "last30days",
    customStartDate: "",
    customEndDate: "",
    programs: [],
    sectors: [],
    regions: [],
    granteeTypes: [],
    grantStatus: "all"
  });

  // Mock data for filters
  const programOptions = ["Rural Entrepreneurship", "Women Entrepreneurship", "Youth Skills", "Green Business"];
  const sectorOptions = ["Agriculture", "Retail", "Handicrafts", "Food Processing", "Services"];
  const regionOptions = ["North", "South", "East", "West", "Central"];
  const granteeTypeOptions = ["Individual", "Group", "SHG", "Micro-enterprise"];
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Handle multi-select change
  const handleMultiSelectChange = (e, field) => {
    const value = e.target.value;
    
    setFilters(prev => {
      if (prev[field].includes(value)) {
        // Remove if already selected
        return {
          ...prev,
          [field]: prev[field].filter(item => item !== value)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [field]: [...prev[field], value]
        };
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      dateRange: "last30days",
      customStartDate: "",
      customEndDate: "",
      programs: [],
      sectors: [],
      regions: [],
      granteeTypes: [],
      grantStatus: "all"
    });
  };

  // Apply filters
  const applyFilters = () => {
    // Prepare date range for API
    let formattedFilters = { ...filters };
    
    // Convert date range to actual dates if using preset ranges
    if (filters.dateRange === "last30days") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      formattedFilters.effectiveStartDate = startDate.toISOString().split('T')[0];
      formattedFilters.effectiveEndDate = endDate.toISOString().split('T')[0];
    } else if (filters.dateRange === "last90days") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      
      formattedFilters.effectiveStartDate = startDate.toISOString().split('T')[0];
      formattedFilters.effectiveEndDate = endDate.toISOString().split('T')[0];
    } else if (filters.dateRange === "thisYear") {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
      
      formattedFilters.effectiveStartDate = startDate.toISOString().split('T')[0];
      formattedFilters.effectiveEndDate = new Date().toISOString().split('T')[0];
    } else if (filters.dateRange === "custom") {
      formattedFilters.effectiveStartDate = filters.customStartDate;
      formattedFilters.effectiveEndDate = filters.customEndDate;
    }
    
    onApplyFilters(formattedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div 
        className="px-6 py-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
        </div>
        <ChevronsUpDown className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
      
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date Range
              </label>
              <select
                id="dateRange"
                name="dateRange"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.dateRange}
                onChange={handleInputChange}
              >
                <option value="last30days">Last 30 days</option>
                <option value="last90days">Last 90 days</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {/* Custom Date Range */}
            {filters.dateRange === "custom" && (
              <>
                <div>
                  <label htmlFor="customStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="customStartDate"
                    name="customStartDate"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={filters.customStartDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="customEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="customEndDate"
                    name="customEndDate"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={filters.customEndDate}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            
            {/* Grant Status */}
            <div>
              <label htmlFor="grantStatus" className="block text-sm font-medium text-gray-700 mb-1">
                <Tag className="h-4 w-4 inline mr-1" />
                Grant Status
              </label>
              <select
                id="grantStatus"
                name="grantStatus"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.grantStatus}
                onChange={handleInputChange}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Programs */}
            <div>
              <label htmlFor="programs" className="block text-sm font-medium text-gray-700 mb-1">
                Programs
              </label>
              <div className="mt-1 space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {programOptions.map((program, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`program-${index}`}
                      type="checkbox"
                      checked={filters.programs.includes(program)}
                      value={program}
                      onChange={(e) => handleMultiSelectChange(e, 'programs')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`program-${index}`} className="ml-2 block text-sm text-gray-700">
                      {program}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sectors */}
            <div>
              <label htmlFor="sectors" className="block text-sm font-medium text-gray-700 mb-1">
                Sectors
              </label>
              <div className="mt-1 space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {sectorOptions.map((sector, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`sector-${index}`}
                      type="checkbox"
                      checked={filters.sectors.includes(sector)}
                      value={sector}
                      onChange={(e) => handleMultiSelectChange(e, 'sectors')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`sector-${index}`} className="ml-2 block text-sm text-gray-700">
                      {sector}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Regions */}
            <div>
              <label htmlFor="regions" className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Regions
              </label>
              <div className="mt-1 space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {regionOptions.map((region, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`region-${index}`}
                      type="checkbox"
                      checked={filters.regions.includes(region)}
                      value={region}
                      onChange={(e) => handleMultiSelectChange(e, 'regions')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`region-${index}`} className="ml-2 block text-sm text-gray-700">
                      {region}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Grantee Types */}
            <div>
              <label htmlFor="granteeTypes" className="block text-sm font-medium text-gray-700 mb-1">
                Grantee Types
              </label>
              <div className="mt-1 space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {granteeTypeOptions.map((type, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`granteeType-${index}`}
                      type="checkbox"
                      checked={filters.granteeTypes.includes(type)}
                      value={type}
                      onChange={(e) => handleMultiSelectChange(e, 'granteeTypes')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`granteeType-${index}`} className="ml-2 block text-sm text-gray-700">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              onClick={applyFilters}
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
