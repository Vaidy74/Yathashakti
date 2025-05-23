"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { CreditCard, ChevronLeft, Save, AlertCircle } from "lucide-react";
import GrantDetailForm from "@/components/grants/GrantDetailForm";
import RepaymentScheduleForm from "@/components/grants/RepaymentScheduleForm";

export default function CreateGrantPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "repayment">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [grantData, setGrantData] = useState({
    // Grant details
    grantIdentifier: "",
    programId: "",
    programName: "",
    granteeId: "",
    granteeName: "",
    amount: 0,
    disbursementDate: "",
    purpose: "",
    status: "Pending Disbursement",
    
    // Repayment details
    repaymentSchedule: []
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Update grant data
  const updateGrantData = (field: string, value: any) => {
    setGrantData(prev => ({
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
  
  // Update repayment installments
  const updateInstallments = (installments) => {
    updateGrantData('repaymentSchedule', installments);
  };
  
  // Handle tab navigation
  const handleTabChange = (tabId: "details" | "repayment") => {
    if (tabId === "repayment" && !validateDetailsTab()) {
      return;
    }
    
    setActiveTab(tabId);
  };
  
  // Validate details tab before proceeding
  const validateDetailsTab = () => {
    const errors = {};
    
    if (!grantData.grantIdentifier.trim()) {
      errors.grantIdentifier = "Grant ID is required";
    }
    
    if (!grantData.programId) {
      errors.programId = "Program selection is required";
    }
    
    if (!grantData.granteeId) {
      errors.granteeId = "Grantee selection is required";
    }
    
    if (!grantData.amount || grantData.amount <= 0) {
      errors.amount = "Valid grant amount is required";
    }
    
    if (!grantData.disbursementDate) {
      errors.disbursementDate = "Disbursement date is required";
    }
    
    if (!grantData.purpose.trim()) {
      errors.purpose = "Grant purpose is required";
    }
    
    if (!grantData.status) {
      errors.status = "Status selection is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate the entire form before submission
  const validateForm = () => {
    const errors = { ...formErrors };
    
    // Validate details tab fields if not already validated
    if (!validateDetailsTab()) {
      return false;
    }
    
    // Validate repayment schedule
    const totalInstallmentAmount = grantData.repaymentSchedule.reduce(
      (sum, installment) => sum + installment.amount, 
      0
    );
    
    if (grantData.repaymentSchedule.length === 0) {
      errors.repaymentSchedule = "At least one repayment installment is required";
    } else if (totalInstallmentAmount !== grantData.amount) {
      errors.repaymentSchedule = "Total installment amount must equal the grant amount";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // If there are errors in the details tab
      if (Object.keys(formErrors).some(key => 
        ['grantIdentifier', 'programId', 'granteeId', 'amount', 'disbursementDate', 'purpose', 'status'].includes(key)
      )) {
        setActiveTab("details");
      } 
      // If there are errors in the repayment tab
      else if (Object.keys(formErrors).some(key => 
        ['repaymentSchedule'].includes(key)
      )) {
        setActiveTab("repayment");
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to create the grant
      console.log("Submitting grant data:", grantData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push("/grants");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <GrantDetailForm 
            formData={grantData} 
            updateFormData={updateGrantData} 
            errors={formErrors}
          />
        );
      case "repayment":
        return (
          <RepaymentScheduleForm
            totalAmount={grantData.amount || 0}
            installments={grantData.repaymentSchedule}
            updateInstallments={updateInstallments}
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
            href="/grants" 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Grants
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <CreditCard className="h-6 w-6 mr-2 text-blue-500" />
            Create New Grant
          </h1>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
            <span>Grant created successfully! Redirecting...</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex">
                <button
                  type="button"
                  className={`px-5 py-4 text-sm font-medium flex items-center whitespace-nowrap ${
                    activeTab === "details"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabChange("details")}
                >
                  Grant Details
                </button>
                <button
                  type="button"
                  className={`px-5 py-4 text-sm font-medium flex items-center whitespace-nowrap ${
                    activeTab === "repayment"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabChange("repayment")}
                >
                  Repayment Schedule
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6 border-b border-gray-200">
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
                  href="/grants"
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
                  {isSubmitting ? "Saving..." : "Create Grant"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
