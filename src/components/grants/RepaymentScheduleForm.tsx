"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar } from 'lucide-react';

interface RepaymentInstallment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paidAmount?: number;
  paidDate?: string;
}

interface RepaymentScheduleFormProps {
  totalAmount: number;
  installments: RepaymentInstallment[];
  updateInstallments: (installments: RepaymentInstallment[]) => void;
  errors: Record<string, string>;
  readOnly?: boolean;
}

export default function RepaymentScheduleForm({ 
  totalAmount, 
  installments, 
  updateInstallments, 
  errors,
  readOnly = false 
}: RepaymentScheduleFormProps) {
  const [scheduleType, setScheduleType] = useState<'manual' | 'equal'>('equal');
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>('');
  const [interval, setInterval] = useState<number>(3); // months

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate remaining amount
  const calculateRemainingAmount = () => {
    const scheduledAmount = installments.reduce((sum, installment) => sum + installment.amount, 0);
    return totalAmount - scheduledAmount;
  };

  // Update installment data
  const updateInstallment = (id: string, field: keyof RepaymentInstallment, value: string | number) => {
    const updatedInstallments = installments.map(installment => 
      installment.id === id ? { ...installment, [field]: value } : installment
    );
    updateInstallments(updatedInstallments);
  };

  // Add a new installment
  const addInstallment = () => {
    const newId = Date.now().toString();
    const newInstallments = [...installments, {
      id: newId,
      dueDate: '',
      amount: 0,
      status: 'pending'
    }];
    updateInstallments(newInstallments);
  };

  // Remove an installment
  const removeInstallment = (id: string) => {
    const updatedInstallments = installments.filter(installment => installment.id !== id);
    updateInstallments(updatedInstallments);
  };

  // Auto-generate equal installments
  const generateEqualInstallments = () => {
    if (!startDate || numberOfInstallments <= 0) {
      return;
    }

    const amountPerInstallment = Math.floor(totalAmount / numberOfInstallments);
    const lastInstallmentAmount = totalAmount - (amountPerInstallment * (numberOfInstallments - 1));
    
    const newInstallments: RepaymentInstallment[] = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < numberOfInstallments; i++) {
      const isLast = i === numberOfInstallments - 1;
      newInstallments.push({
        id: `auto-${i + 1}`,
        dueDate: currentDate.toISOString().split('T')[0],
        amount: isLast ? lastInstallmentAmount : amountPerInstallment,
        status: 'pending'
      });
      
      // Add months for next installment
      currentDate.setMonth(currentDate.getMonth() + interval);
    }
    
    updateInstallments(newInstallments);
  };

  // Listen for schedule type change
  useEffect(() => {
    if (scheduleType === 'equal' && startDate && numberOfInstallments > 0) {
      generateEqualInstallments();
    }
  }, [scheduleType, startDate, numberOfInstallments, interval]);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Repayment Schedule</h2>
        <p className="text-sm text-gray-500">
          Define how and when the grant will be repaid
        </p>
      </div>

      {/* Total and remaining amount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-700">Total Grant Amount</p>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-sm text-green-700">Amount Scheduled for Repayment</p>
          <p className="text-xl font-bold text-green-900">{formatCurrency(totalAmount - calculateRemainingAmount())}</p>
        </div>
      </div>

      {!readOnly && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900">Schedule Type</h3>
            <div className="mt-2 flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="equal"
                  checked={scheduleType === 'equal'}
                  onChange={() => setScheduleType('equal')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Equal Installments</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="manual"
                  checked={scheduleType === 'manual'}
                  onChange={() => setScheduleType('manual')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Manual Entry</span>
              </label>
            </div>
          </div>

          {scheduleType === 'equal' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="numberOfInstallments" className="block text-sm font-medium text-gray-700">
                  Number of Installments
                </label>
                <input
                  type="number"
                  id="numberOfInstallments"
                  value={numberOfInstallments}
                  onChange={(e) => setNumberOfInstallments(parseInt(e.target.value) || 0)}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  First Payment Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                  Interval (months)
                </label>
                <input
                  type="number"
                  id="interval"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {scheduleType === 'manual' && (
            <div className="mt-2">
              <button
                type="button"
                onClick={addInstallment}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Installment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Installments List */}
      {installments.length === 0 ? (
        <div className="bg-gray-50 p-4 text-center rounded-md">
          <p className="text-gray-500">No repayment installments have been added yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installment
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {!readOnly && (
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {installments.map((installment, index) => (
                <tr key={installment.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <input
                        type="date"
                        value={installment.dueDate || ''}
                        onChange={(e) => updateInstallment(installment.id, 'dueDate', e.target.value)}
                        className="border-0 py-0 focus:ring-0 text-sm text-gray-900"
                        disabled={readOnly}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        value={installment.amount || ''}
                        onChange={(e) => updateInstallment(installment.id, 'amount', parseFloat(e.target.value) || 0)}
                        className={`block w-full pl-6 border-0 focus:ring-0 text-sm text-gray-900 ${readOnly ? 'bg-transparent' : ''}`}
                        disabled={readOnly || scheduleType === 'equal'}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {readOnly ? (
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          installment.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : installment.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : installment.status === 'partially_paid'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {installment.status === 'partially_paid' 
                          ? 'Partially Paid' 
                          : installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                      </span>
                    ) : (
                      <select
                        value={installment.status}
                        onChange={(e) => updateInstallment(installment.id, 'status', e.target.value as any)}
                        className="block w-full border-0 py-0 focus:ring-0 text-sm text-gray-900"
                        disabled={readOnly}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="partially_paid">Partially Paid</option>
                      </select>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => removeInstallment(installment.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={scheduleType === 'equal'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Total
                </td>
                <td className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  {formatCurrency(installments.reduce((sum, inst) => sum + inst.amount, 0))}
                </td>
                <td colSpan={readOnly ? 1 : 2}></td>
              </tr>
              {calculateRemainingAmount() !== 0 && (
                <tr className={calculateRemainingAmount() > 0 ? "text-red-700" : "text-yellow-700"}>
                  <td colSpan={2} className="px-4 py-3 text-left text-sm font-medium">
                    {calculateRemainingAmount() > 0 ? "Unscheduled Amount" : "Overscheduled Amount"}
                  </td>
                  <td className="px-4 py-3 text-left text-sm font-medium">
                    {formatCurrency(Math.abs(calculateRemainingAmount()))}
                  </td>
                  <td colSpan={readOnly ? 1 : 2}></td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}

      {errors.repaymentSchedule && (
        <p className="mt-1 text-sm text-red-500">{errors.repaymentSchedule}</p>
      )}
    </div>
  );
}
