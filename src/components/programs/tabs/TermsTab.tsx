import { useState } from "react";
import { Plus, Trash2, DollarSign, Calendar, AlertCircle, Info } from "lucide-react";

const TermsTab = ({ data, updateData, criteria, setCriteria, errors }) => {
  const [newCriterion, setNewCriterion] = useState({
    title: "",
    description: ""
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Reset the new criterion form
  const resetCriterionForm = () => {
    setNewCriterion({
      title: "",
      description: ""
    });
    setValidationErrors({});
  };

  // Update new criterion field
  const updateNewCriterion = (field, value) => {
    setNewCriterion(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate the new criterion
  const validateCriterion = () => {
    const errors = {};
    
    if (!newCriterion.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!newCriterion.description.trim()) {
      errors.description = "Description is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add a new criterion
  const addCriterion = () => {
    if (validateCriterion()) {
      setCriteria([...criteria, { ...newCriterion, id: Date.now().toString() }]);
      resetCriterionForm();
    }
  };

  // Remove a criterion
  const removeCriterion = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Grant Terms & Eligibility</h2>
        <p className="text-sm text-gray-500">
          Define the terms under which revolving grants will be disbursed and eligibility criteria
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Grant Size Range */}
        <div className="border border-gray-200 rounded-md p-5">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-base font-medium text-gray-900">Grant Size</h3>
          </div>
          <div className="space-y-4">
            {/* Minimum Grant Size */}
            <div>
              <label htmlFor="minGrantSize" className="block text-sm font-medium text-gray-700">
                Minimum Grant Size (₹) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  id="minGrantSize"
                  min="0"
                  value={data.minGrantSize}
                  onChange={(e) => updateData("minGrantSize", parseInt(e.target.value) || 0)}
                  className={`block w-full pl-7 pr-3 py-2 border ${
                    errors.minGrantSize ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="5000"
                />
              </div>
              {errors.minGrantSize && (
                <p className="mt-1 text-sm text-red-500">{errors.minGrantSize}</p>
              )}
            </div>

            {/* Maximum Grant Size */}
            <div>
              <label htmlFor="maxGrantSize" className="block text-sm font-medium text-gray-700">
                Maximum Grant Size (₹) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  id="maxGrantSize"
                  min="0"
                  value={data.maxGrantSize}
                  onChange={(e) => updateData("maxGrantSize", parseInt(e.target.value) || 0)}
                  className={`block w-full pl-7 pr-3 py-2 border ${
                    errors.maxGrantSize ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="50000"
                />
              </div>
              {errors.maxGrantSize && (
                <p className="mt-1 text-sm text-red-500">{errors.maxGrantSize}</p>
              )}
              {data.minGrantSize > data.maxGrantSize && data.maxGrantSize > 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Maximum grant size must be greater than minimum grant size
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Repayment Terms */}
        <div className="border border-gray-200 rounded-md p-5">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-base font-medium text-gray-900">Repayment Tenor</h3>
          </div>
          <div className="space-y-4">
            {/* Minimum Repayment Tenor */}
            <div>
              <label htmlFor="minRepaymentTenor" className="block text-sm font-medium text-gray-700">
                Minimum Tenor (months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="minRepaymentTenor"
                min="1"
                value={data.minRepaymentTenor}
                onChange={(e) => updateData("minRepaymentTenor", parseInt(e.target.value) || 1)}
                className={`mt-1 block w-full border ${
                  errors.minRepaymentTenor ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="1"
              />
              {errors.minRepaymentTenor && (
                <p className="mt-1 text-sm text-red-500">{errors.minRepaymentTenor}</p>
              )}
            </div>

            {/* Maximum Repayment Tenor */}
            <div>
              <label htmlFor="maxRepaymentTenor" className="block text-sm font-medium text-gray-700">
                Maximum Tenor (months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="maxRepaymentTenor"
                min="1"
                value={data.maxRepaymentTenor}
                onChange={(e) => updateData("maxRepaymentTenor", parseInt(e.target.value) || 1)}
                className={`mt-1 block w-full border ${
                  errors.maxRepaymentTenor ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="12"
              />
              {errors.maxRepaymentTenor && (
                <p className="mt-1 text-sm text-red-500">{errors.maxRepaymentTenor}</p>
              )}
              {data.minRepaymentTenor > data.maxRepaymentTenor && data.maxRepaymentTenor > 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Maximum tenor must be greater than minimum tenor
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Criteria Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Eligibility Criteria</h3>
        
        {/* Existing Criteria List */}
        {criteria.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
            <ul className="divide-y divide-gray-200">
              {criteria.map((criterion) => (
                <li 
                  key={criterion.id} 
                  className="px-6 py-4 flex items-start justify-between"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{criterion.title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{criterion.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCriterion(criterion.id)}
                    className="ml-2 text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add New Criterion Form */}
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-medium text-gray-900">Add Eligibility Criterion</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Criterion Title */}
              <div>
                <label htmlFor="criterion-title" className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="criterion-title"
                  value={newCriterion.title}
                  onChange={(e) => updateNewCriterion("title", e.target.value)}
                  className={`mt-1 block w-full border ${
                    validationErrors.title ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="E.g., Age Requirement"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
                )}
              </div>

              {/* Criterion Description */}
              <div>
                <label htmlFor="criterion-description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="criterion-description"
                  rows={3}
                  value={newCriterion.description}
                  onChange={(e) => updateNewCriterion("description", e.target.value)}
                  className={`mt-1 block w-full border ${
                    validationErrors.description ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="E.g., Beneficiaries must be between 18-45 years of age"
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetCriterionForm}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={addCriterion}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Criterion
              </button>
            </div>
          </div>
        </div>

        {/* Example Criteria */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Example Eligibility Criteria</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
              <span>Age requirements (e.g., beneficiaries must be adults)</span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
              <span>Income thresholds (e.g., annual household income below ₹2,00,000)</span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
              <span>Geographic restrictions (e.g., residents of specific districts/villages)</span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
              <span>Business criteria (e.g., minimum 1 year in operation)</span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
              <span>Demographic targeting (e.g., women entrepreneurs, marginalized groups)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Information card */}
      <div className="bg-blue-50 p-4 rounded-md flex mt-6">
        <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">About Revolving Grants</h4>
          <p className="text-sm text-blue-700 mt-1">
            Revolving grants are moral repayments made by beneficiaries after utilizing funds, creating a sustainable 
            fund that can support more beneficiaries over time. Clear terms and eligibility criteria help 
            manage expectations and ensure appropriate distribution of funds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsTab;
