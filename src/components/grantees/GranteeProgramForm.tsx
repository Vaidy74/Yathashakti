import { useState, useEffect } from "react";

// Example sectors for the demo
const SECTORS = [
  "Agriculture",
  "Handicrafts",
  "Retail",
  "Food Processing",
  "Textiles & Clothing",
  "Services",
  "Small Manufacturing",
  "Animal Husbandry",
  "Other"
];

// Mock programs for demo purposes
const MOCK_PROGRAMS = [
  { id: "prog1", name: "Women Entrepreneurship Initiative", sector: "Handicrafts" },
  { id: "prog2", name: "Rural Livelihoods Program", sector: "Agriculture" },
  { id: "prog3", name: "Youth Business Incubation", sector: "Services" },
  { id: "prog4", name: "Village Enterprise Fund", sector: "Retail" },
  { id: "prog5", name: "Micro Enterprise Development", sector: "Food Processing" }
];

const GranteeProgramForm = ({ data, updateData, errors }) => {
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  // Filter programs when sector changes
  useEffect(() => {
    if (data.sector) {
      setIsLoadingPrograms(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const filteredPrograms = MOCK_PROGRAMS.filter(
          program => program.sector === data.sector || program.sector === "All"
        );
        setAvailablePrograms(filteredPrograms);
        setIsLoadingPrograms(false);
      }, 500);
    } else {
      setAvailablePrograms([]);
    }
  }, [data.sector]);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Sector & Program Information</h2>
        <p className="text-sm text-gray-500">Details about the grantee's economic activity and associated program</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Sector/Business Type */}
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
            Sector/Business Type <span className="text-red-500">*</span>
          </label>
          <select
            id="sector"
            value={data.sector}
            onChange={(e) => {
              updateData("sector", e.target.value);
              // Reset program when sector changes
              updateData("programId", "");
              updateData("programName", "");
            }}
            className={`mt-1 block w-full border ${
              errors.sector ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select sector</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          {errors.sector && (
            <p className="mt-1 text-sm text-red-500">{errors.sector}</p>
          )}
        </div>
        
        {/* Program */}
        <div>
          <label htmlFor="programId" className="block text-sm font-medium text-gray-700">
            Associated Program
          </label>
          <select
            id="programId"
            value={data.programId}
            onChange={(e) => {
              updateData("programId", e.target.value);
              const selectedProgram = availablePrograms.find(p => p.id === e.target.value);
              updateData("programName", selectedProgram ? selectedProgram.name : "");
            }}
            disabled={isLoadingPrograms || availablePrograms.length === 0}
            className={`mt-1 block w-full border ${
              errors.programId ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              (isLoadingPrograms || availablePrograms.length === 0) && !data.sector
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
          >
            <option value="">
              {isLoadingPrograms
                ? "Loading programs..."
                : availablePrograms.length === 0
                ? data.sector
                  ? "No programs available for selected sector"
                  : "Select a sector first"
                : "Select a program"}
            </option>
            {availablePrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          {errors.programId && (
            <p className="mt-1 text-sm text-red-500">{errors.programId}</p>
          )}
        </div>
      </div>

      <div className="pt-5 border-t border-gray-200">
        <h3 className="text-md font-medium text-gray-900 mb-4">Business/Venture Details</h3>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Business/Venture Activities */}
          <div>
            <label htmlFor="activities" className="block text-sm font-medium text-gray-700">
              Business/Venture Activities
            </label>
            <textarea
              id="activities"
              rows={3}
              value={data.activities}
              onChange={(e) => updateData("activities", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe the business activities or venture"
            />
          </div>
          
          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={data.notes}
              onChange={(e) => updateData("notes", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Any additional information about the grantee"
            />
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-gray-200">
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                After adding a grantee, you can connect them to a specific grant and set up repayment schedules from the Grantee Details page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GranteeProgramForm;
