"use client";

import React, { useState } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';

interface FundingSource {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  currency: string;
  allocationDate: string;
  notes: string;
}

// Mock donor data for the selector
const MOCK_DONORS = [
  { id: 'd1', name: 'Foundation Alpha' },
  { id: 'd2', name: 'Corporate Giving Initiative' },
  { id: 'd3', name: 'Philanthropic Trust Beta' },
  { id: 'd4', name: 'Individual Donor Group' }
];

interface FundingTabProps {
  initialFunding?: FundingSource[];
  readOnly?: boolean;
}

export default function FundingTab({ initialFunding = [], readOnly = false }: FundingTabProps) {
  const [fundingSources, setFundingSources] = useState<FundingSource[]>(
    initialFunding.length > 0 ? initialFunding : [
      {
        id: '1',
        donorId: '',
        donorName: '',
        amount: 0,
        currency: 'INR',
        allocationDate: '',
        notes: ''
      }
    ]
  );

  const [totalFunding, setTotalFunding] = useState<number>(() => 
    initialFunding.reduce((sum, source) => sum + source.amount, 0)
  );

  // Add a new funding source
  const addFundingSource = () => {
    const newId = (fundingSources.length + 1).toString();
    setFundingSources([
      ...fundingSources,
      {
        id: newId,
        donorId: '',
        donorName: '',
        amount: 0,
        currency: 'INR',
        allocationDate: '',
        notes: ''
      }
    ]);
  };

  // Remove a funding source
  const removeFundingSource = (id: string) => {
    const sourceToRemove = fundingSources.find(source => source.id === id);
    if (sourceToRemove) {
      setTotalFunding(prev => prev - sourceToRemove.amount);
    }
    
    setFundingSources(fundingSources.filter(source => source.id !== id));
  };

  // Update funding source data
  const updateFundingSource = (id: string, field: keyof FundingSource, value: string | number) => {
    setFundingSources(fundingSources.map(source => {
      if (source.id === id) {
        // If updating the amount, recalculate the total
        if (field === 'amount') {
          const oldAmount = source.amount;
          const newAmount = typeof value === 'number' ? value : parseFloat(value) || 0;
          setTotalFunding(prev => prev - oldAmount + newAmount);
        }
        
        // If updating the donor, set the donor name as well
        if (field === 'donorId' && typeof value === 'string') {
          const selectedDonor = MOCK_DONORS.find(donor => donor.id === value);
          return { 
            ...source, 
            [field]: value, 
            donorName: selectedDonor?.name || ''
          };
        }
        
        return { ...source, [field]: value };
      }
      return source;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Funding Sources</h2>
          <p className="text-sm text-gray-500">Track donor contributions to this program</p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addFundingSource}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Funding Source
          </button>
        )}
      </div>

      {/* Total Funding Display */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <div className="flex items-center">
          <DollarSign className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <p className="text-sm font-medium text-blue-800">Total Program Funding</p>
            <p className="text-2xl font-bold text-blue-900">₹{totalFunding.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {fundingSources.length === 0 ? (
        <div className="bg-gray-50 p-4 text-center rounded-md">
          <p className="text-gray-500">No funding sources have been added yet.</p>
        </div>
      ) : (
        fundingSources.map((source, index) => (
          <div
            key={source.id}
            className="bg-white shadow-sm rounded-lg border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-gray-900">Funding Source {index + 1}</h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeFundingSource(source.id)}
                  className="text-red-500 hover:text-red-700"
                  disabled={fundingSources.length === 1 && !readOnly}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Donor */}
              <div>
                <label htmlFor={`donor-${source.id}`} className="block text-sm font-medium text-gray-700">
                  Donor
                </label>
                <select
                  id={`donor-${source.id}`}
                  value={source.donorId}
                  onChange={(e) => updateFundingSource(source.id, 'donorId', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={readOnly}
                >
                  <option value="">Select a donor</option>
                  {MOCK_DONORS.map((donor) => (
                    <option key={donor.id} value={donor.id}>
                      {donor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor={`amount-${source.id}`} className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    id={`amount-${source.id}`}
                    value={source.amount || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      updateFundingSource(source.id, 'amount', value);
                    }}
                    className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                    disabled={readOnly}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">INR</span>
                  </div>
                </div>
              </div>

              {/* Allocation Date */}
              <div>
                <label htmlFor={`date-${source.id}`} className="block text-sm font-medium text-gray-700">
                  Allocation Date
                </label>
                <input
                  type="date"
                  id={`date-${source.id}`}
                  value={source.allocationDate}
                  onChange={(e) => updateFundingSource(source.id, 'allocationDate', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={readOnly}
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label htmlFor={`notes-${source.id}`} className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id={`notes-${source.id}`}
                  value={source.notes}
                  onChange={(e) => updateFundingSource(source.id, 'notes', e.target.value)}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Additional information about this funding source"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
