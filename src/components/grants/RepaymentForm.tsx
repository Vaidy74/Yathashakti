"use client";

import React, { useState } from 'react';
import { DollarSign, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { RepaymentMethod, RepaymentFormData, RepaymentFormErrors, Grant, RepaymentInstallment } from '@/types/grant';
import { toast } from 'react-hot-toast';

interface RepaymentFormProps {
  grant: Grant;
  installment?: RepaymentInstallment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RepaymentForm({ grant, installment, onSuccess, onCancel }: RepaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<RepaymentFormData>({
    amount: installment ? installment.expectedAmount : 0,
    date: new Date().toISOString().split('T')[0],
    method: RepaymentMethod.BANK_TRANSFER,
    notes: ""
  });
  const [formErrors, setFormErrors] = useState<RepaymentFormErrors>({});

  // Calculate remaining amount to be paid for this grant
  const totalAmount = grant.amount || 0;
  const repaidAmount = grant.repaymentHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const remainingAmount = totalAmount - repaidAmount;
  
  // Format currency display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Validate the payment form
  const validateForm = (): boolean => {
    const errors: RepaymentFormErrors = {};
    
    if (!paymentDetails.amount || paymentDetails.amount <= 0) {
      errors.amount = "Amount must be greater than zero";
    }
    
    if (paymentDetails.amount > remainingAmount) {
      errors.amount = `Amount exceeds remaining balance (${formatCurrency(remainingAmount)})`;
    }
    
    if (!paymentDetails.date) {
      errors.date = "Payment date is required";
    }
    
    if (!paymentDetails.method) {
      errors.method = "Payment method is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Build payment payload
      const payload = {
        ...paymentDetails,
        installmentId: installment?.id // Include installment ID if available
      };
      
      // Make API request to record payment
      const response = await fetch(`/api/grants/${grant.id}/repayments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to record payment: ${response.statusText}`);
      }
      
      // Show success message
      toast.success('Payment recorded successfully');
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error("Error recording payment:", err);
      setFormErrors({
        ...formErrors,
        general: err instanceof Error ? err.message : "Failed to record payment"
      });
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-5 flex items-center">
        <DollarSign className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">
          Record Repayment {installment && `for Installment #${installment.id}`}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grant Info */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Grant ID</p>
              <p className="mt-1 text-sm text-gray-900">{grant.grantIdentifier}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Grantee</p>
              <p className="mt-1 text-sm text-gray-900">{grant.grantee?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Remaining Amount</p>
              <p className="mt-1 text-sm font-semibold text-blue-600">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>
        </div>
        
        {/* Amount Field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Payment Amount *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              value={paymentDetails.amount || ''}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                amount: parseFloat(e.target.value) || 0
              })}
              max={remainingAmount}
              required
            />
          </div>
          {formErrors.amount && (
            <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
          )}
        </div>

        {/* Payment Method Field */}
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700">
            Payment Method *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="method"
              name="method"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              value={paymentDetails.method}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                method: e.target.value as RepaymentMethod
              })}
              required
            >
              {Object.values(RepaymentMethod).map((method) => (
                <option key={method} value={method}>
                  {method.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {formErrors.method && (
            <p className="mt-1 text-sm text-red-600">{formErrors.method}</p>
          )}
        </div>

        {/* Payment Date Field */}
        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
            Payment Date *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              name="paymentDate"
              id="paymentDate"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={paymentDetails.date}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                date: e.target.value
              })}
              required
            />
          </div>
          {formErrors.date && (
            <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
          )}
        </div>

        {/* Notes Field */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add any additional notes about the payment"
              value={paymentDetails.notes || ''}
              onChange={(e) => setPaymentDetails({
                ...paymentDetails,
                notes: e.target.value
              })}
            />
          </div>
        </div>

        {/* General Error Message */}
        {formErrors.general && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{formErrors.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Record Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
