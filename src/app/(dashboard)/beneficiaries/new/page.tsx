"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, ChevronLeft, AlertCircle, Save } from "lucide-react";
import BeneficiaryPersonalForm from "@/components/beneficiaries/BeneficiaryPersonalForm";
import BeneficiaryGrantForm from "@/components/beneficiaries/BeneficiaryGrantForm";

export default function AddBeneficiaryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [beneficiaryData, setBeneficiaryData] = useState({
    // Personal Information
    name: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    dateOfBirth: "",
    idType: "",
    idNumber: "",
    
    // Grant Information
    programId: "",
    venture: "",
    ventureDescription: "",
    grantAmount: 0,
    disbursementDate: new Date().toISOString().slice(0, 10),
    repaymentTenor: 12,
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Update beneficiary data (for basic fields)
  const updateBeneficiaryData = (field, value) => {
    setBeneficiaryData(prev => ({
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
      console.log("Submitting beneficiary data:", {
        beneficiaryData
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push("/beneficiaries");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/beneficiaries" 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Beneficiaries
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-500" />
            Add New Beneficiary
          </h1>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
            <span>Beneficiary added successfully! Redirecting...</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              <BeneficiaryPersonalForm 
                data={beneficiaryData} 
                updateData={updateBeneficiaryData}
                errors={formErrors}
              />
            </div>
            
            {/* Grant Information */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Grant Information</h2>
              <BeneficiaryGrantForm 
                data={beneficiaryData} 
                updateData={updateBeneficiaryData}
                errors={formErrors}
              />
            </div>
            
            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Fields marked with <span className="text-red-500">*</span> are required</span>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/beneficiaries"
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
                  {isSubmitting ? "Saving..." : "Save Beneficiary"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
