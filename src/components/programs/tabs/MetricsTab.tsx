import { useState } from "react";
import { Plus, Trash2, AlertCircle, PlusCircle, Info } from "lucide-react";

// Metric types
const METRIC_TYPES = [
  "Numeric",
  "Percentage",
  "Currency",
  "Rating",
  "Yes/No",
  "Text"
];

// Frequency options
const FREQUENCY_OPTIONS = [
  "One-time",
  "Monthly",
  "Quarterly",
  "Semi-annually",
  "Annually"
];

// Example metrics for suggestions
const EXAMPLE_METRICS = [
  {
    name: "Number of beneficiaries",
    description: "Total number of individuals directly benefiting from the program",
    type: "Numeric",
    frequency: "Quarterly",
    targetValue: "100"
  },
  {
    name: "Repayment rate",
    description: "Percentage of revolving grants repaid on time",
    type: "Percentage",
    frequency: "Monthly",
    targetValue: "90"
  },
  {
    name: "Average income increase",
    description: "Average percentage increase in beneficiary income after program intervention",
    type: "Percentage",
    frequency: "Annually",
    targetValue: "25"
  },
  {
    name: "Grant utilization rate",
    description: "Percentage of grant funds utilized for intended purpose",
    type: "Percentage",
    frequency: "Quarterly",
    targetValue: "95"
  }
];

const MetricsTab = ({ metrics, setMetrics, errors }) => {
  const [showExamples, setShowExamples] = useState(false);
  const [newMetric, setNewMetric] = useState({
    name: "",
    description: "",
    type: "",
    frequency: "",
    targetValue: "",
    notes: ""
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Reset the new metric form
  const resetForm = () => {
    setNewMetric({
      name: "",
      description: "",
      type: "",
      frequency: "",
      targetValue: "",
      notes: ""
    });
    setValidationErrors({});
  };

  // Update new metric field
  const updateNewMetric = (field, value) => {
    setNewMetric(prev => ({
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

  // Validate the new metric
  const validateMetric = () => {
    const errors = {};
    
    if (!newMetric.name.trim()) {
      errors.name = "Metric name is required";
    }
    
    if (!newMetric.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!newMetric.type) {
      errors.type = "Metric type is required";
    }
    
    if (!newMetric.frequency) {
      errors.frequency = "Reporting frequency is required";
    }
    
    if (!newMetric.targetValue.trim()) {
      errors.targetValue = "Target value is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add a new metric
  const addMetric = () => {
    if (validateMetric()) {
      const updatedMetrics = [...metrics, { ...newMetric, id: Date.now().toString() }];
      setMetrics(updatedMetrics);
      resetForm();
    }
  };

  // Remove a metric
  const removeMetric = (id) => {
    const updatedMetrics = metrics.filter(metric => metric.id !== id);
    setMetrics(updatedMetrics);
  };

  // Add example metric to the list
  const addExampleMetric = (example) => {
    const updatedMetrics = [...metrics, { ...example, id: Date.now().toString() }];
    setMetrics(updatedMetrics);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Success Metrics</h2>
        <p className="text-sm text-gray-500">
          Define how you'll measure success for this program
        </p>
      </div>

      {/* Current Metrics List */}
      {metrics.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.map((metric, index) => (
                <tr key={metric.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{metric.name}</div>
                    <div className="text-sm text-gray-500">{metric.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.targetValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => removeMetric(metric.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Metric Form */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-medium text-gray-900">Add New Metric</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Metric Name */}
            <div>
              <label htmlFor="metric-name" className="block text-sm font-medium text-gray-700">
                Metric Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="metric-name"
                value={newMetric.name}
                onChange={(e) => updateNewMetric("name", e.target.value)}
                className={`mt-1 block w-full border ${
                  validationErrors.name ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="E.g., Number of beneficiaries"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Metric Type */}
            <div>
              <label htmlFor="metric-type" className="block text-sm font-medium text-gray-700">
                Metric Type <span className="text-red-500">*</span>
              </label>
              <select
                id="metric-type"
                value={newMetric.type}
                onChange={(e) => updateNewMetric("type", e.target.value)}
                className={`mt-1 block w-full border ${
                  validationErrors.type ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="">Select a type</option>
                {METRIC_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {validationErrors.type && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.type}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="metric-description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="metric-description"
                rows={2}
                value={newMetric.description}
                onChange={(e) => updateNewMetric("description", e.target.value)}
                className={`mt-1 block w-full border ${
                  validationErrors.description ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Brief description of what this metric measures and why it's important"
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
              )}
            </div>

            {/* Reporting Frequency */}
            <div>
              <label htmlFor="metric-frequency" className="block text-sm font-medium text-gray-700">
                Reporting Frequency <span className="text-red-500">*</span>
              </label>
              <select
                id="metric-frequency"
                value={newMetric.frequency}
                onChange={(e) => updateNewMetric("frequency", e.target.value)}
                className={`mt-1 block w-full border ${
                  validationErrors.frequency ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="">Select frequency</option>
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {validationErrors.frequency && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.frequency}</p>
              )}
            </div>

            {/* Target Value */}
            <div>
              <label htmlFor="metric-target" className="block text-sm font-medium text-gray-700">
                Target Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="metric-target"
                value={newMetric.targetValue}
                onChange={(e) => updateNewMetric("targetValue", e.target.value)}
                className={`mt-1 block w-full border ${
                  validationErrors.targetValue ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Target value to achieve"
              />
              {validationErrors.targetValue && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.targetValue}</p>
              )}
            </div>

            {/* Optional Notes */}
            <div className="sm:col-span-2">
              <label htmlFor="metric-notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                id="metric-notes"
                rows={2}
                value={newMetric.notes}
                onChange={(e) => updateNewMetric("notes", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Any additional notes about data collection, calculation method, etc."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={addMetric}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Metric
            </button>
          </div>
        </div>
      </div>

      {/* Example Metrics Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-900">Example Metrics</h3>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            {showExamples ? "Hide Examples" : "Show Examples"}
          </button>
        </div>
        
        {showExamples && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {EXAMPLE_METRICS.map((example, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{example.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{example.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addExampleMetric(example)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Type: {example.type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Frequency: {example.frequency}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Target: {example.targetValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Information Alert */}
      <div className="bg-blue-50 p-4 rounded-md flex mt-6">
        <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">Metric Best Practices</h4>
          <p className="text-sm text-blue-700 mt-1">
            Good metrics are SMART: Specific, Measurable, Achievable, Relevant, and Time-bound. 
            Include both output metrics (what you produce) and outcome metrics (what changes as a result).
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricsTab;
