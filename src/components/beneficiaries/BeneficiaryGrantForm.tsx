import { Calendar, DollarSign, Building, Briefcase } from "lucide-react";

// Mock programs data (in a real app, this would come from an API)
const MOCK_PROGRAMS = [
  {
    id: "1",
    name: "Rural Entrepreneurship Initiative"
  },
  {
    id: "2",
    name: "Women Empowerment Program"
  },
  {
    id: "3",
    name: "Education for All"
  },
  {
    id: "4",
    name: "Digital Literacy Program"
  },
  {
    id: "5",
    name: "Healthcare Initiative"
  }
];

// Common venture types
const VENTURE_TYPES = [
  "Agriculture",
  "Handicrafts",
  "Retail Shop",
  "Food Processing",
  "Dairy",
  "Poultry",
  "Tailoring",
  "Beauty Salon",
  "Computer Services",
  "Tutoring",
  "Healthcare Services",
  "Auto Repair",
  "Transportation",
  "Other"
];

const BeneficiaryGrantForm = ({ data, updateData, errors }) => {
  return (
    <div className="space-y-6">
      {/* Program Selection */}
      <div>
        <label htmlFor="programId" className="block text-sm font-medium text-gray-700">
          Program <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <select
            id="programId"
            value={data.programId}
            onChange={(e) => updateData("programId", e.target.value)}
            className={`block w-full border ${
              errors.programId ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select program</option>
            {MOCK_PROGRAMS.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
        {errors.programId && (
          <p className="mt-1 text-sm text-red-500">{errors.programId}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Venture Type */}
        <div>
          <label htmlFor="venture" className="block text-sm font-medium text-gray-700">
            Venture Type <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="venture"
              value={data.venture}
              onChange={(e) => updateData("venture", e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.venture ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">Select venture type</option>
              {VENTURE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {errors.venture && (
            <p className="mt-1 text-sm text-red-500">{errors.venture}</p>
          )}
        </div>

        {/* Grant Amount */}
        <div>
          <label htmlFor="grantAmount" className="block text-sm font-medium text-gray-700">
            Grant Amount (₹) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="grantAmount"
              min="0"
              value={data.grantAmount || ""}
              onChange={(e) => updateData("grantAmount", parseInt(e.target.value) || 0)}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.grantAmount ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="15000"
            />
          </div>
          {errors.grantAmount && (
            <p className="mt-1 text-sm text-red-500">{errors.grantAmount}</p>
          )}
        </div>

        {/* Disbursement Date */}
        <div>
          <label htmlFor="disbursementDate" className="block text-sm font-medium text-gray-700">
            Disbursement Date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="disbursementDate"
              value={data.disbursementDate}
              onChange={(e) => updateData("disbursementDate", e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.disbursementDate ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>
          {errors.disbursementDate && (
            <p className="mt-1 text-sm text-red-500">{errors.disbursementDate}</p>
          )}
        </div>

        {/* Repayment Tenor */}
        <div>
          <label htmlFor="repaymentTenor" className="block text-sm font-medium text-gray-700">
            Repayment Tenor (months) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="repaymentTenor"
            min="1"
            max="36"
            value={data.repaymentTenor}
            onChange={(e) => updateData("repaymentTenor", parseInt(e.target.value) || 12)}
            className={`mt-1 block w-full border ${
              errors.repaymentTenor ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="12"
          />
          {errors.repaymentTenor && (
            <p className="mt-1 text-sm text-red-500">{errors.repaymentTenor}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Typical repayment period ranges from 6 to 24 months
          </p>
        </div>
      </div>

      {/* Venture Description */}
      <div>
        <label htmlFor="ventureDescription" className="block text-sm font-medium text-gray-700">
          Venture Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="ventureDescription"
          rows={4}
          value={data.ventureDescription}
          onChange={(e) => updateData("ventureDescription", e.target.value)}
          className={`mt-1 block w-full border ${
            errors.ventureDescription ? "border-red-300" : "border-gray-300"
          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="Please provide a brief description of the beneficiary's business or venture"
        />
        {errors.ventureDescription && (
          <p className="mt-1 text-sm text-red-500">{errors.ventureDescription}</p>
        )}
      </div>

      {/* Repayment Information Card */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">About Revolving Grants</h3>
        <p className="text-sm text-blue-700">
          Revolving grants are morally repayable, interest-free grants that beneficiaries are expected to repay 
          over time so that funds can be redistributed to other beneficiaries. The expected repayment schedule 
          will be automatically calculated based on the grant amount and tenor.
        </p>
      </div>
    </div>
  );
};

export default BeneficiaryGrantForm;
