"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Check, X, AlertCircle, Clock, CheckCircle, RefreshCcw } from 'lucide-react';
import { Grant, RepaymentInstallment, Repayment, RepaymentMethod, InstallmentStatus, RepaymentFormData, RepaymentFormErrors } from '@/types/grant';

interface RepaymentTabProps {
  grant: any; // Will be updated to Grant type once we have proper API integration
}

export default function RepaymentTab({ grant }: RepaymentTabProps) {
  // State for repayment schedule and history
  const [installments, setInstallments] = useState<RepaymentInstallment[]>(grant.repaymentSchedule || []);
  const [repaymentHistory, setRepaymentHistory] = useState<Repayment[]>(grant.repaymentHistory || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch repayment data from API
  const fetchRepaymentData = async () => {
    if (!grant.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/grants/${grant.id}/repayments`);
      
      if (!response.ok) {
        throw new Error(`Error fetching repayment data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRepaymentHistory(data.repayments || []);
      
      // Also fetch the installments if available
      const scheduleResponse = await fetch(`/api/grants/${grant.id}/repayment-schedule`);
      
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        setInstallments(scheduleData.installments || []);
      }
    } catch (err) {
      console.error("Error fetching repayment data:", err);
      setError(err instanceof Error ? err.message : "Failed to load repayment data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data when component mounts
  useEffect(() => {
    fetchRepaymentData();
  }, [grant.id]);
  
  // UI state
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<RepaymentInstallment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [paymentDetails, setPaymentDetails] = useState<RepaymentFormData>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: RepaymentMethod.BANK_TRANSFER,
    notes: ""
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<RepaymentFormErrors>({});
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Calculate repayment statistics
  const calculateStats = () => {
    const totalAmount = grant.amount || 0;
    
    // Calculate from repayment history
    const repaidAmount = repaymentHistory.reduce((sum, item) => sum + item.amount, 0);
    
    const pendingAmount = totalAmount - repaidAmount;
    const completionPercentage = totalAmount > 0 ? (repaidAmount / totalAmount) * 100 : 0;

    return {
      totalAmount,
      repaidAmount,
      pendingAmount,
      completionPercentage
    };
  };

  const stats = calculateStats();
  
  // Get status badge style
  const getStatusBadge = (status: InstallmentStatus) => {
    switch (status) {
      case InstallmentStatus.PAID:
        return "bg-green-100 text-green-800";
      case InstallmentStatus.PARTIALLY_PAID:
        return "bg-blue-100 text-blue-800";
      case InstallmentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case InstallmentStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      case InstallmentStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Handle opening the add payment modal
  const handleOpenPaymentModal = (installment: RepaymentInstallment) => {
    setSelectedInstallment(installment);
    setPaymentDetails({
      amount: installment.expectedAmount,
      date: new Date().toISOString().split('T')[0],
      method: RepaymentMethod.BANK_TRANSFER,
      notes: ""
    });
    setShowAddPaymentModal(true);
  };

  // Validate the payment form
  const validateForm = (): boolean => {
    const errors: RepaymentFormErrors = {};
    
    if (!paymentDetails.amount || paymentDetails.amount <= 0) {
      errors.amount = "Amount must be greater than zero";
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

  // Handle recording a payment
  const handleRecordPayment = async () => {
    if (!selectedInstallment || !grant.id) return;
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/grants/${grant.id}/repayments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...paymentDetails,
          installmentId: selectedInstallment.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to record payment: ${response.statusText}`);
      }
      
      // Refresh the repayment data
      await fetchRepaymentData();
      
      // Close the modal
      setShowAddPaymentModal(false);
    } catch (err) {
      console.error("Error recording payment:", err);
      setFormErrors({
        ...formErrors,
        general: err instanceof Error ? err.message : "Failed to record payment"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Repayment Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Grant Amount</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalAmount)}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Repaid Amount</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.repaidAmount)}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.pendingAmount)}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Repayment Progress</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.completionPercentage.toFixed(0)}%</div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Schedule */}
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Repayment Schedule</h3>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Error loading repayment data: {error}</p>
          </div>
        ) : installments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No repayment schedule found for this grant.</p>
            <button 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => fetchRepaymentData()}
            >
              <RefreshCcw className="inline-block h-4 w-4 mr-1" /> Refresh
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {installments.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              {formatDate(item.dueDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatCurrency(item.expectedAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.paymentDate ? formatDate(item.paymentDate) : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                            {/* Use optional chaining to safely access notes property */}
                            {item.notes || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {item.status !== InstallmentStatus.PAID && (
                              <button
                                onClick={() => handleOpenPaymentModal(item)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Record Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Record Payment</h3>
                    <div className="mt-4 space-y-4">
                      {/* Amount Field */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Amount
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 pr-12 sm:text-sm border-gray-300 rounded-md"
                            value={paymentDetails.amount}
                            onChange={(e) => setPaymentDetails({
                              ...paymentDetails,
                              amount: parseFloat(e.target.value)
                            })}
                          />
                          {formErrors.amount && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
                          )}
                        </div>
                      </div>

                      {/* Payment Method Field */}
                      <div>
                        <label htmlFor="method" className="block text-sm font-medium text-gray-700">
                          Payment Method
                        </label>
                        <div className="mt-1">
                          <select
                            id="method"
                            name="method"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={paymentDetails.method}
                            onChange={(e) => setPaymentDetails({
                              ...paymentDetails,
                              method: e.target.value as RepaymentMethod
                            })}
                          >
                            {Object.values(RepaymentMethod).map((method) => (
                              <option key={method} value={method}>{method.replace('_', ' ')}</option>
                            ))}
                          </select>
                          {formErrors.method && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.method}</p>
                          )}
                        </div>
                      </div>

                      {/* Payment Date Field */}
                      <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                          Payment Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            name="paymentDate"
                            id="paymentDate"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={paymentDetails.date}
                            onChange={(e) => setPaymentDetails({
                              ...paymentDetails,
                              date: e.target.value
                            })}
                          />
                          {formErrors.date && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                          )}
                        </div>
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
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleRecordPayment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Record Payment'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddPaymentModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
