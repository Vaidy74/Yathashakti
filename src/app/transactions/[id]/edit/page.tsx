"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArrowLeft, 
  Save,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import { TransactionWithRelations, TransactionType, TransactionStatus, PaymentMethod } from "@/types/transaction";
import { validateTransactionUpdate, ValidationError } from "@/utils/validations/transactionValidation";

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [transaction, setTransaction] = useState<TransactionWithRelations | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    date: "",
    type: "",
    category: "",
    amount: 0,
    paymentMethod: "",
    reference: "",
    status: "",
    notes: "",
    grantId: "",
    donorId: "",
    serviceProviderId: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch transaction
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/transactions/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Transaction not found");
          }
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setTransaction(data);
        
        // Format date for input field (YYYY-MM-DD)
        const dateObj = new Date(data.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        
        setFormData({
          description: data.description,
          date: formattedDate,
          type: data.type,
          category: data.category,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          reference: data.reference || "",
          status: data.status,
          notes: data.notes || "",
          grantId: data.grantId || "",
          donorId: data.donorId || "",
          serviceProviderId: data.serviceProviderId || ""
        });
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError(err instanceof Error ? err.message : "Failed to load transaction");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle number input change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  // Validate form data
  const validateForm = () => {
    // Reset previous errors
    setValidationErrors([]);
    setFieldErrors({});
    
    // Validate transaction data
    const errors = validateTransactionUpdate(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      
      // Create field-specific error messages
      const fieldErrorMap: Record<string, string> = {};
      errors.forEach(error => {
        if (error.field !== 'general') {
          fieldErrorMap[error.field] = error.message;
        }
      });
      
      setFieldErrors(fieldErrorMap);
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        // Handle validation errors from the server
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.details) {
            setValidationErrors(errorData.details);
            
            // Create field-specific error messages
            const fieldErrorMap: Record<string, string> = {};
            errorData.details.forEach((error: ValidationError) => {
              if (error.field !== 'general') {
                fieldErrorMap[error.field] = error.message;
              }
            });
            
            setFieldErrors(fieldErrorMap);
            setError(errorData.message || 'Validation failed');
            setIsSaving(false);
            return;
          }
        }
        
        throw new Error(`Error: ${response.status}`);
      }
      
      router.push(`/transactions/${id}`);
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError(err instanceof Error ? err.message : "Failed to update transaction");
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href={`/transactions/${id}`} className="text-blue-600 hover:text-blue-800 mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Transaction
          </h1>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading transaction details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <p className="mt-2 text-sm">
                  <Link href="/ledger" className="text-red-700 font-medium underline">
                    Go back to ledger
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className={`block w-full border ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {fieldErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={`block w-full border ${fieldErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {fieldErrors.date && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Type</option>
                    <option value={TransactionType.INCOME}>Income</option>
                    <option value={TransactionType.EXPENSE}>Expense</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleNumberChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Payment Method</option>
                    {Object.values(PaymentMethod).map((method) => (
                      <option key={method} value={method}>
                        {method.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Status</option>
                    {Object.values(TransactionStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
              
              {/* Relationships */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Related Records</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label htmlFor="grantId" className="block text-sm font-medium text-gray-700 mb-1">
                      Grant ID
                    </label>
                    <input
                      type="text"
                      id="grantId"
                      name="grantId"
                      value={formData.grantId}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="donorId" className="block text-sm font-medium text-gray-700 mb-1">
                      Donor ID
                    </label>
                    <input
                      type="text"
                      id="donorId"
                      name="donorId"
                      value={formData.donorId}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="serviceProviderId" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Provider ID
                    </label>
                    <input
                      type="text"
                      id="serviceProviderId"
                      name="serviceProviderId"
                      value={formData.serviceProviderId}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <Link
                href={`/transactions/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
