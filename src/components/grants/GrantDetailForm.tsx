"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

// Mock programs for the dropdown
const MOCK_PROGRAMS = [
  { id: "p1", name: "Rural Entrepreneurship Initiative" },
  { id: "p2", name: "Women Empowerment Program" },
  { id: "p3", name: "Digital Literacy Program" },
  { id: "p4", name: "Youth Business Incubation" }
];

// Mock grantees data
const MOCK_GRANTEES = [
  { id: "1", name: "Rajesh Kumar", sector: "Agriculture" },
  { id: "2", name: "Meera Devi", sector: "Handicrafts" },
  { id: "3", name: "Suresh Yadav", sector: "Agriculture" },
  { id: "4", name: "Priya Sharma", sector: "Tailoring" },
  { id: "5", name: "Vikram Mehta", sector: "Services" },
  { id: "6", name: "Anjali Gupta", sector: "Retail" }
];

interface GrantDetailFormProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function GrantDetailForm({ formData, updateFormData, errors }: GrantDetailFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof MOCK_GRANTEES>([]);
  const [showResults, setShowResults] = useState(false);

  // Handle grantee search
  const handleGranteeSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() !== "") {
      const filteredGrantees = MOCK_GRANTEES.filter(
        grantee => grantee.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredGrantees);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Select a grantee from search results
  const selectGrantee = (grantee: typeof MOCK_GRANTEES[0]) => {
    updateFormData('granteeId', grantee.id);
    updateFormData('granteeName', grantee.name);
    setSearchQuery(grantee.name);
    setShowResults(false);
  };

  // Generate a unique grant identifier
  useEffect(() => {
    if (!formData.grantIdentifier) {
      const currentYear = new Date().getFullYear();
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      updateFormData('grantIdentifier', `GRT-${currentYear}-${randomNumber}`);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Grant Details</h2>
        <p className="text-sm text-gray-500">
          Basic information about the grant
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Grant Identifier */}
        <div>
          <label htmlFor="grantIdentifier" className="block text-sm font-medium text-gray-700">
            Grant ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="grantIdentifier"
            value={formData.grantIdentifier || ""}
            onChange={(e) => updateFormData("grantIdentifier", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.grantIdentifier ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="GRT-YYYY-XXXX"
            readOnly
          />
          {errors.grantIdentifier && (
            <p className="mt-1 text-sm text-red-500">{errors.grantIdentifier}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Automatically generated unique identifier for this grant
          </p>
        </div>

        {/* Program Selection */}
        <div>
          <label htmlFor="programId" className="block text-sm font-medium text-gray-700">
            Program <span className="text-red-500">*</span>
          </label>
          <select
            id="programId"
            value={formData.programId || ""}
            onChange={(e) => {
              updateFormData("programId", e.target.value);
              const selectedProgram = MOCK_PROGRAMS.find(p => p.id === e.target.value);
              if (selectedProgram) {
                updateFormData("programName", selectedProgram.name);
              }
            }}
            className={`mt-1 block w-full border ${
              errors.programId ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select a program</option>
            {MOCK_PROGRAMS.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          {errors.programId && (
            <p className="mt-1 text-sm text-red-500">{errors.programId}</p>
          )}
        </div>

        {/* Grantee Search */}
        <div className="md:col-span-2">
          <label htmlFor="granteeSearch" className="block text-sm font-medium text-gray-700">
            Grantee <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="granteeSearch"
              value={searchQuery}
              onChange={(e) => handleGranteeSearch(e.target.value)}
              className={`mt-1 block w-full border ${
                errors.granteeId ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Search for grantee by name"
              onFocus={() => searchQuery && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />

            {/* Search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto">
                {searchResults.map((grantee) => (
                  <div
                    key={grantee.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => selectGrantee(grantee)}
                  >
                    <div className="font-medium">{grantee.name}</div>
                    <div className="text-xs text-gray-500">{grantee.sector}</div>
                  </div>
                ))}
              </div>
            )}

            {showResults && searchResults.length === 0 && searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md py-2 px-4">
                <p className="text-gray-500">No grantees found</p>
              </div>
            )}
          </div>
          {errors.granteeId && (
            <p className="mt-1 text-sm text-red-500">{errors.granteeId}</p>
          )}
          {formData.granteeName && (
            <p className="mt-1 text-sm text-blue-600">
              Selected: {formData.granteeName}
            </p>
          )}
        </div>

        {/* Grant Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Grant Amount (₹) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              value={formData.amount || ""}
              onChange={(e) => updateFormData("amount", e.target.value !== "" ? parseFloat(e.target.value) : "")}
              className={`block w-full pl-7 pr-12 border ${
                errors.amount ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">INR</span>
            </div>
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
          )}
        </div>

        {/* Disbursement Date */}
        <div>
          <label htmlFor="disbursementDate" className="block text-sm font-medium text-gray-700">
            Disbursement Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="disbursementDate"
            value={formData.disbursementDate || ""}
            onChange={(e) => updateFormData("disbursementDate", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.disbursementDate ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {errors.disbursementDate && (
            <p className="mt-1 text-sm text-red-500">{errors.disbursementDate}</p>
          )}
        </div>

        {/* Grant Purpose */}
        <div className="md:col-span-2">
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Grant Purpose <span className="text-red-500">*</span>
          </label>
          <textarea
            id="purpose"
            rows={3}
            value={formData.purpose || ""}
            onChange={(e) => updateFormData("purpose", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.purpose ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Describe the purpose of this grant"
          />
          {errors.purpose && (
            <p className="mt-1 text-sm text-red-500">{errors.purpose}</p>
          )}
        </div>

        {/* Grant Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            value={formData.status || ""}
            onChange={(e) => updateFormData("status", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.status ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select status</option>
            <option value="Pending Disbursement">Pending Disbursement</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
          )}
        </div>
      </div>
    </div>
  );
}
