import { Info } from "lucide-react";

// Theory of Change tab component
const ToCTab = ({ data, updateData, errors }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Theory of Change</h2>
        <p className="text-sm text-gray-500">
          Define how your program will create impact by connecting activities to outcomes
        </p>
      </div>

      {/* Informational card explaining Theory of Change */}
      <div className="bg-blue-50 p-4 rounded-md flex mb-6">
        <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">What is a Theory of Change?</h4>
          <p className="text-sm text-blue-700 mt-1">
            A Theory of Change is a comprehensive description of how and why a desired change is expected 
            to happen in a particular context. It maps out the causal pathways from program activities to 
            outcomes to long-term impact, making explicit the assumptions underlying each step.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Problem Statement */}
        <div>
          <label htmlFor="problemStatement" className="block text-sm font-medium text-gray-700">
            Problem Statement <span className="text-red-500">*</span>
          </label>
          <textarea
            id="problemStatement"
            rows={3}
            value={data.problemStatement}
            onChange={(e) => updateData("problemStatement", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.problemStatement ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Describe the social problem this program aims to address"
          />
          {errors.problemStatement && (
            <p className="mt-1 text-sm text-red-500">{errors.problemStatement}</p>
          )}
        </div>

        {/* Long-term Goal */}
        <div>
          <label htmlFor="longTermGoal" className="block text-sm font-medium text-gray-700">
            Long-term Goal <span className="text-red-500">*</span>
          </label>
          <textarea
            id="longTermGoal"
            rows={3}
            value={data.longTermGoal}
            onChange={(e) => updateData("longTermGoal", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.longTermGoal ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="What is the ultimate impact or change this program aims to achieve?"
          />
          {errors.longTermGoal && (
            <p className="mt-1 text-sm text-red-500">{errors.longTermGoal}</p>
          )}
        </div>

        {/* Target Population */}
        <div>
          <label htmlFor="targetPopulation" className="block text-sm font-medium text-gray-700">
            Target Population <span className="text-red-500">*</span>
          </label>
          <textarea
            id="targetPopulation"
            rows={3}
            value={data.targetPopulation}
            onChange={(e) => updateData("targetPopulation", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.targetPopulation ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Describe the primary beneficiaries or stakeholders affected by this program"
          />
          {errors.targetPopulation && (
            <p className="mt-1 text-sm text-red-500">{errors.targetPopulation}</p>
          )}
        </div>

        {/* Two-column layout for outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Medium-term Outcomes */}
          <div>
            <label htmlFor="mediumTermOutcomes" className="block text-sm font-medium text-gray-700">
              Medium-term Outcomes <span className="text-red-500">*</span>
            </label>
            <textarea
              id="mediumTermOutcomes"
              rows={4}
              value={data.mediumTermOutcomes}
              onChange={(e) => updateData("mediumTermOutcomes", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.mediumTermOutcomes ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Changes expected to occur within 1-3 years of program implementation"
            />
            {errors.mediumTermOutcomes && (
              <p className="mt-1 text-sm text-red-500">{errors.mediumTermOutcomes}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Example: Increased business sustainability, improved livelihood options
            </p>
          </div>

          {/* Short-term Outcomes */}
          <div>
            <label htmlFor="shortTermOutcomes" className="block text-sm font-medium text-gray-700">
              Short-term Outcomes <span className="text-red-500">*</span>
            </label>
            <textarea
              id="shortTermOutcomes"
              rows={4}
              value={data.shortTermOutcomes}
              onChange={(e) => updateData("shortTermOutcomes", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.shortTermOutcomes ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Immediate changes expected to result from program activities"
            />
            {errors.shortTermOutcomes && (
              <p className="mt-1 text-sm text-red-500">{errors.shortTermOutcomes}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Example: Increased knowledge, improved skills, changed attitudes
            </p>
          </div>
        </div>

        {/* Two-column layout for outputs and activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Outputs */}
          <div>
            <label htmlFor="outputs" className="block text-sm font-medium text-gray-700">
              Outputs <span className="text-red-500">*</span>
            </label>
            <textarea
              id="outputs"
              rows={4}
              value={data.outputs}
              onChange={(e) => updateData("outputs", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.outputs ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="The direct products of program activities"
            />
            {errors.outputs && (
              <p className="mt-1 text-sm text-red-500">{errors.outputs}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Example: Number of people trained, number of grants disbursed
            </p>
          </div>

          {/* Activities */}
          <div>
            <label htmlFor="activities" className="block text-sm font-medium text-gray-700">
              Activities <span className="text-red-500">*</span>
            </label>
            <textarea
              id="activities"
              rows={4}
              value={data.activities}
              onChange={(e) => updateData("activities", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.activities ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="The specific interventions the program will implement"
            />
            {errors.activities && (
              <p className="mt-1 text-sm text-red-500">{errors.activities}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Example: Conducting training workshops, distributing revolving grants
            </p>
          </div>
        </div>

        {/* Key Assumptions */}
        <div>
          <label htmlFor="keyAssumptions" className="block text-sm font-medium text-gray-700">
            Key Assumptions <span className="text-red-500">*</span>
          </label>
          <textarea
            id="keyAssumptions"
            rows={3}
            value={data.keyAssumptions}
            onChange={(e) => updateData("keyAssumptions", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.keyAssumptions ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Critical conditions that must hold true for the theory of change to work as expected"
          />
          {errors.keyAssumptions && (
            <p className="mt-1 text-sm text-red-500">{errors.keyAssumptions}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Example: Target communities will be receptive to program interventions, economic conditions remain stable
          </p>
        </div>
      </div>

      {/* Visual Explanation */}
      <div className="mt-8 border border-gray-200 rounded-md p-5 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Theory of Change Flow</h3>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col items-center text-center p-3 mb-3 md:mb-0">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <span className="text-blue-600 text-xs font-semibold">Step 1</span>
            </div>
            <span className="text-sm font-medium">Inputs & Activities</span>
            <span className="text-xs text-gray-500 mt-1">Resources & actions</span>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="flex flex-col items-center text-center p-3 mb-3 md:mb-0">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <span className="text-green-600 text-xs font-semibold">Step 2</span>
            </div>
            <span className="text-sm font-medium">Outputs</span>
            <span className="text-xs text-gray-500 mt-1">Direct results</span>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="flex flex-col items-center text-center p-3 mb-3 md:mb-0">
            <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
              <span className="text-yellow-600 text-xs font-semibold">Step 3</span>
            </div>
            <span className="text-sm font-medium">Outcomes</span>
            <span className="text-xs text-gray-500 mt-1">Short & medium term</span>
          </div>
          <div className="hidden md:block text-gray-400">→</div>
          <div className="flex flex-col items-center text-center p-3">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <span className="text-purple-600 text-xs font-semibold">Step 4</span>
            </div>
            <span className="text-sm font-medium">Impact</span>
            <span className="text-xs text-gray-500 mt-1">Long-term change</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToCTab;
