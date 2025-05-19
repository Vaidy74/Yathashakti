"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Briefcase, ChevronLeft, Save, AlertCircle,
  FileText, Target, DollarSign, Users, 
  Calendar, Layers, Clipboard, Heart, PieChart
} from "lucide-react";

// Tabs for program creation
const tabs = [
  { id: "details", label: "Details", icon: <FileText className="h-4 w-4" /> },
  { id: "toc", label: "ToC", icon: <Clipboard className="h-4 w-4" /> },
  { id: "metrics", label: "Metrics", icon: <Target className="h-4 w-4" /> },
  { id: "terms", label: "Terms", icon: <FileText className="h-4 w-4" /> },
  { id: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
  { id: "milestones", label: "Milestones", icon: <Calendar className="h-4 w-4" /> },
  { id: "docs", label: "Docs", icon: <Layers className="h-4 w-4" /> },
  { id: "funding", label: "Funding", icon: <Heart className="h-4 w-4" /> },
  { id: "budget", label: "Budget", icon: <DollarSign className="h-4 w-4" /> },
];

// Import tab content components
import DetailsTab from "@/components/programs/tabs/DetailsTab";
import ToCTab from "@/components/programs/tabs/ToCTab";
import MetricsTab from "@/components/programs/tabs/MetricsTab";
import TermsTab from "@/components/programs/tabs/TermsTab";
import TeamTab from "@/components/programs/tabs/TeamTab";
import MilestonesTab from "@/components/programs/tabs/MilestonesTab";
import DocsTab from "@/components/programs/tabs/DocsTab";
import FundingTab from "@/components/programs/tabs/FundingTab";
import BudgetTab from "@/components/programs/tabs/BudgetTab";

export default function AddProgramPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Program form state
  const [programData, setProgramData] = useState({
    // Basic Details
    name: "",
    summary: "",
    category: "",
    status: "PLANNING",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    sdgGoals: [],
    serviceProviders: [],
    
    // Theory of Change
    problemStatement: "",
    longTermGoal: "",
    targetPopulation: "",
    shortTermOutcomes: "",
    mediumTermOutcomes: "",
    outputs: "",
    activities: "",
    keyAssumptions: "",
    
    // Grant Terms
    minGrantSize: 0,
    maxGrantSize: 0,
    minRepaymentTenor: 1,
    maxRepaymentTenor: 12,
    
    // Budget
    budgetForRevolvingGrants: 0,
  });
  
  // Dynamic arrays for various program elements
  const [metrics, setMetrics] = useState([]);
  const [eligibilityCriteria, setEligibilityCriteria] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [funding, setFunding] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Handle tab navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Update program data (for basic fields)
  const updateProgramData = (field, value) => {
    setProgramData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app this would be an API call
      console.log("Submitting program data:", {
        programData,
        metrics,
        eligibilityCriteria,
        teamMembers,
        milestones,
        documents,
        funding,
        expenses
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push("/programs");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <DetailsTab 
            data={programData} 
            updateData={updateProgramData}
            errors={formErrors}
          />
        );
      case "toc":
        return (
          <ToCTab 
            data={programData} 
            updateData={updateProgramData}
            errors={formErrors}
          />
        );
      case "metrics":
        return (
          <MetricsTab 
            metrics={metrics}
            setMetrics={setMetrics}
            errors={formErrors}
          />
        );
      case "terms":
        return (
          <TermsTab 
            data={programData}
            updateData={updateProgramData}
            criteria={eligibilityCriteria}
            setCriteria={setEligibilityCriteria}
            errors={formErrors}
          />
        );
      case "team":
        return (
          <TeamTab 
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            errors={formErrors}
          />
        );
      case "milestones":
        return (
          <MilestonesTab 
            milestones={milestones}
            setMilestones={setMilestones}
            errors={formErrors}
          />
        );
      case "docs":
        return (
          <DocsTab 
            documents={documents}
            setDocuments={setDocuments}
            errors={formErrors}
          />
        );
      case "funding":
        return (
          <FundingTab 
            funding={funding}
            setFunding={setFunding}
            errors={formErrors}
          />
        );
      case "budget":
        return (
          <BudgetTab 
            data={programData}
            updateData={updateProgramData}
            expenses={expenses}
            setExpenses={setExpenses}
            errors={formErrors}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/programs" 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Programs
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Briefcase className="h-6 w-6 mr-2 text-blue-500" />
            Add New Program
          </h1>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
            <span>Program created successfully! Redirecting...</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`px-5 py-4 text-sm font-medium flex items-center whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {renderTabContent()}
            </div>
            
            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Fields marked with <span className="text-red-500">*</span> are required</span>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/programs"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Program"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
