"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, ChevronLeft, AlertCircle, Save, Loader2 } from "lucide-react";
import GranteePersonalForm from "@/components/grantees/GranteePersonalForm";
import GranteeProgramForm from "@/components/grantees/GranteeProgramForm";
import GranteeDocumentsForm from "@/components/grantees/GranteeDocumentsForm";
import { GranteeFormData, DocumentData, FormErrors } from "@/types/grantee";

export default function EditGranteePage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [error, setError] = useState("");
  
  // Form state
  const [granteeData, setGranteeData] = useState<GranteeFormData>({
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
    
    // Program & Sector Information
    sector: "",
    programId: "",
    programName: "",
    activities: "",
    notes: "",
  });
  
  // Documents state
  const [documents, setDocuments] = useState<DocumentData[]>([
    { type: "ID Proof", file: null, description: "" },
    { type: "Address Proof", file: null, description: "" }
  ]);
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Fetch existing grantee data
  useEffect(() => {
    const fetchGrantee = async () => {
      if (!id || typeof id !== 'string') {
        setError("Invalid grantee ID");
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/grantees/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Grantee not found");
          } else {
            throw new Error(`Error: ${response.status}`);
          }
          return;
        }
        
        const data = await response.json();
        
        // Transform API data to form data structure
        setGranteeData({
          name: data.name || "",
          gender: data.gender || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          village: data.village || "",
          district: data.district || "",
          state: data.state || "",
          pincode: data.pincode || "",
          dateOfBirth: data.dateOfBirth || "",
          idType: data.idType || "",
          idNumber: data.idNumber || "",
          sector: data.sector || "",
          programId: data.grants?.[0]?.programId || "",
          programName: data.grants?.[0]?.programName || "",
          activities: data.activities || "",
          notes: data.notes || "",
        });
        
        // Load documents if any
        if (data.documents && data.documents.length > 0) {
          // Since we can't actually load the file objects from API,
          // we'll just show the descriptions for existing documents
          const existingDocuments = data.documents.map((doc: any) => ({
            type: doc.type,
            file: null,
            description: doc.name,
            id: doc.id // Store the ID for reference when updating
          }));
          
          setDocuments(existingDocuments);
        }
      } catch (err) {
        setError("Error fetching grantee details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGrantee();
    }
  }, [id]);
  
  // Update grantee data (for basic fields)
  const updateGranteeData = (field: string, value: string) => {
    setGranteeData(prev => ({
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
  
  // Handle tab navigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors: FormErrors = {};
    
    // Validate personal information
    if (!granteeData.name.trim()) errors.name = "Name is required";
    if (!granteeData.phone.trim()) errors.phone = "Phone number is required";
    if (!granteeData.village.trim()) errors.village = "Village/Town is required";
    if (!granteeData.district.trim()) errors.district = "District is required";
    if (!granteeData.state) errors.state = "State is required";
    
    // Validate sector information
    if (!granteeData.sector.trim()) errors.sector = "Sector is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // If there are errors, switch to the tab containing the first error
      if (formErrors.name || formErrors.gender || formErrors.phone || 
          formErrors.village || formErrors.district || formErrors.state || 
          formErrors.idType || formErrors.idNumber) {
        setActiveTab("personal");
      } else if (formErrors.sector || formErrors.programId) {
        setActiveTab("program");
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send data to API
      const response = await fetch(`/api/grantees/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(granteeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update grantee');
      }
      
      const result = await response.json();
      
      // Handle document updates if any
      const documentsToUpload = documents.filter(doc => doc.file !== null);
      if (documentsToUpload.length > 0) {
        // In a real implementation, we would upload documents here
        // This would involve FormData and a separate documents API endpoint
        console.log("Would upload documents for grantee ID:", id);
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push(`/grantees/${id}`);
      }, 2000);
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      // Show error in UI
      setFormErrors(prev => ({
        ...prev,
        form: error instanceof Error ? error.message : 'Failed to update grantee. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <GranteePersonalForm 
            data={granteeData} 
            updateData={updateGranteeData}
            errors={formErrors}
          />
        );
      case "program":
        return (
          <GranteeProgramForm 
            data={granteeData} 
            updateData={updateGranteeData}
            errors={formErrors}
          />
        );
      case "documents":
        return (
          <GranteeDocumentsForm 
            documents={documents}
            setDocuments={setDocuments}
            errors={formErrors}
          />
        );
      default:
        return null;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-96 bg-gray-100 animate-pulse flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Link 
              href="/grantees" 
              className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Grantees
            </Link>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link 
            href={`/grantees/${id}`} 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Grantee
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-500" />
            Edit Grantee
          </h1>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
            <span>Grantee updated successfully! Redirecting...</span>
          </div>
        )}
        
        {formErrors.form && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{formErrors.form}</span>
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
                    activeTab === "personal"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabChange("personal")}
                >
                  Personal Information
                </button>
                <button
                  type="button"
                  className={`px-5 py-4 text-sm font-medium flex items-center whitespace-nowrap ${
                    activeTab === "program"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabChange("program")}
                >
                  Sector & Program
                </button>
                <button
                  type="button"
                  className={`px-5 py-4 text-sm font-medium flex items-center whitespace-nowrap ${
                    activeTab === "documents"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabChange("documents")}
                >
                  Documents
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
                  href={`/grantees/${id}`}
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
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
