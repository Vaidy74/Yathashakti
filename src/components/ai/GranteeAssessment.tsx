"use client";

import { useState } from "react";
import { ArrowRight, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface GranteeAssessmentProps {
  granteeData?: {
    id: string;
    name: string;
    sector: string;
    experience: string;
    location: string;
    businessPlan: string;
    requestedAmount: number;
  };
}

export default function GranteeAssessment({ granteeData }: GranteeAssessmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("");

  // Default grantee data if none provided
  const defaultGrantee = {
    id: "GT001",
    name: "Priya Sharma",
    sector: "Agriculture",
    experience: "3 years",
    location: "Alwar, Rajasthan",
    businessPlan: "Expansion of dairy farming operation with purchase of two additional cows and equipment for milk processing.",
    requestedAmount: 25000
  };

  const grantee = granteeData || defaultGrantee;

  // Generate AI assessment using the API
  const generateAssessment = async () => {
    setIsLoading(true);
    
    try {
      // Call our API endpoint which connects to OpenRouter
      const response = await fetch('/api/ai/grantee-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ granteeData: grantee }),
      });

      if (!response.ok) {
        throw new Error('Failed to get assessment from API');
      }

      const data = await response.json();
      
      // Update the model info if available
      if (data.model) {
        setModelUsed(data.model);
      }
      
      setAssessment(data);
    } catch (error) {
      console.error('Error generating assessment:', error);
      alert('Failed to generate assessment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset assessment
  const resetAssessment = () => {
    setAssessment(null);
    setShowDetails(false);
  };

  // Get risk level color
  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-600";
    if (score < 60) return "text-yellow-600"; 
    return "text-red-600";
  };

  // Get risk level text
  const getRiskLevel = (score: number) => {
    if (score < 30) return "Low Risk";
    if (score < 60) return "Medium Risk";
    return "High Risk";
  };

  // Get repayment probability color
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          AI Grantee Assessment
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get AI-powered insights and recommendations for this grantee
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {!assessment && !isLoading && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-900">Grantee Information</h4>
                {modelUsed && (
                  <span className="text-xs text-blue-500">
                    Will use {modelUsed.split('/').pop()}
                  </span>
                )}
              </div>
              <div className="mt-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{grantee.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sector</p>
                    <p className="text-sm font-medium">{grantee.sector}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium">{grantee.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-medium">{grantee.experience}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Requested Amount</p>
                    <p className="text-sm font-medium">₹{grantee.requestedAmount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Business Plan</p>
                    <p className="text-sm font-medium">{grantee.businessPlan}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={generateAssessment}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Generate AI Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-4 text-sm text-gray-500">
              Analyzing grantee profile and generating assessment...
            </p>
          </div>
        )}
        
        {assessment && (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{grantee.name}</h4>
                <div className="flex items-center">
                  <p className="text-sm text-gray-500">Assessment Results</p>
                  {modelUsed && (
                    <span className="ml-2 text-xs text-gray-500">
                      Powered by {modelUsed.split('/').pop()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={resetAssessment}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset
              </button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Risk Score */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-col items-center">
                    <div className={`text-3xl font-bold ${getRiskColor(assessment.riskScore)}`}>
                      {assessment.riskScore}/100
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-500">Risk Score</div>
                    <div className={`mt-1 text-sm ${getRiskColor(assessment.riskScore)}`}>
                      {getRiskLevel(assessment.riskScore)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Repayment Probability */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-col items-center">
                    <div className={`text-3xl font-bold ${getProbabilityColor(assessment.repaymentProbability)}`}>
                      {assessment.repaymentProbability}%
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-500">Repayment Probability</div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${
                          assessment.repaymentProbability >= 80 
                            ? 'bg-green-600' 
                            : assessment.repaymentProbability >= 60 
                            ? 'bg-yellow-600' 
                            : 'bg-red-600'
                        } h-2 rounded-full`} 
                        style={{ width: `${assessment.repaymentProbability}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{assessment.recommendedAmount.toLocaleString()}
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-500">Recommended Amount</div>
                    <div className="mt-1 text-sm text-blue-600">
                      {assessment.recommendedProgram}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              {showDetails ? "Hide Details" : "Show Detailed Assessment"}
              <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
            
            {showDetails && (
              <div className="mt-6 space-y-6">
                {/* Strengths */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
                  <ul className="space-y-2">
                    {assessment.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Concerns */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Areas of Concern</h4>
                  <ul className="space-y-2">
                    {assessment.concerns.map((concern, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Similar Grantees */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Similar Grantees</h4>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sector
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Repayment Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assessment.similarGrantees.map((similar) => (
                          <tr key={similar.id}>
                            <td className="px-4 py-2 text-xs text-blue-600">{similar.id}</td>
                            <td className="px-4 py-2 text-xs">{similar.name}</td>
                            <td className="px-4 py-2 text-xs">{similar.sector}</td>
                            <td className="px-4 py-2 text-xs text-green-600">{similar.repaymentRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
