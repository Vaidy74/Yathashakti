import { useState } from "react";
import { CalendarIcon, Tag, Info } from "lucide-react";

// SDG goals for selection
const SDG_GOALS = [
  { id: 1, name: "No Poverty" },
  { id: 2, name: "Zero Hunger" },
  { id: 3, name: "Good Health and Well-being" },
  { id: 4, name: "Quality Education" },
  { id: 5, name: "Gender Equality" },
  { id: 6, name: "Clean Water and Sanitation" },
  { id: 7, name: "Affordable and Clean Energy" },
  { id: 8, name: "Decent Work and Economic Growth" },
  { id: 9, name: "Industry, Innovation and Infrastructure" },
  { id: 10, name: "Reduced Inequality" },
  { id: 11, name: "Sustainable Cities and Communities" },
  { id: 12, name: "Responsible Consumption and Production" },
  { id: 13, name: "Climate Action" },
  { id: 14, name: "Life Below Water" },
  { id: 15, name: "Life on Land" },
  { id: 16, name: "Peace, Justice and Strong Institutions" },
  { id: 17, name: "Partnerships for the Goals" },
];

// Categories for the program
const PROGRAM_CATEGORIES = [
  "Agriculture",
  "Education",
  "Entrepreneurship",
  "Environment",
  "Healthcare",
  "Skilling",
  "Technology",
  "Women Empowerment",
  "Youth Development",
  "Other",
];

const DetailsTab = ({ data, updateData, errors }) => {
  const [selectedSDGs, setSelectedSDGs] = useState(data.sdgGoals || []);
  
  // Toggle SDG selection
  const toggleSDG = (sdgId) => {
    if (selectedSDGs.includes(sdgId)) {
      setSelectedSDGs(selectedSDGs.filter(id => id !== sdgId));
      updateData("sdgGoals", selectedSDGs.filter(id => id !== sdgId));
    } else {
      const newSelection = [...selectedSDGs, sdgId];
      setSelectedSDGs(newSelection);
      updateData("sdgGoals", newSelection);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Program Details</h2>
        <p className="text-sm text-gray-500">Basic information about the program</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Program Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Program Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={data.name}
            onChange={(e) => updateData("name", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.name ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="E.g., Rural Entrepreneurship Initiative"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Program Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={data.category}
            onChange={(e) => updateData("category", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.category ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select a category</option>
            {PROGRAM_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Program Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            value={data.status}
            onChange={(e) => updateData("status", e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="PLANNING">Planning</option>
            <option value="LIVE">Live</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="startDate"
              value={data.startDate}
              onChange={(e) => updateData("startDate", e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.startDate ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="endDate"
              value={data.endDate}
              onChange={(e) => updateData("endDate", e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Leave empty if program is ongoing with no defined end date
          </p>
        </div>

        {/* Columns spanning full width */}
        <div className="md:col-span-2">
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
            Program Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            id="summary"
            rows={4}
            value={data.summary}
            onChange={(e) => updateData("summary", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.summary ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Brief description of the program's objectives and scope"
          />
          {errors.summary && (
            <p className="mt-1 text-sm text-red-500">{errors.summary}</p>
          )}
        </div>
      </div>

      {/* SDG Goals Section */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sustainable Development Goals (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SDG_GOALS.map((sdg) => (
            <div 
              key={sdg.id}
              onClick={() => toggleSDG(sdg.id)}
              className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                selectedSDGs.includes(sdg.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center ${
                selectedSDGs.includes(sdg.id) ? "opacity-100" : "opacity-0"
              }`}>
                <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">
                  SDG {sdg.id}: {sdg.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 p-4 rounded-md flex mt-6">
        <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">Program Setup Guidance</h4>
          <p className="text-sm text-blue-700 mt-1">
            This is the first step in setting up your program. After completing the basic details, you'll need to define your Theory of Change, success metrics, eligibility criteria, and budget in the subsequent tabs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;
