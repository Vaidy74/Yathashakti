"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  quantity: number;
  totalAmount: number;
}

interface BudgetTabProps {
  initialBudget?: BudgetItem[];
  readOnly?: boolean;
}

// Predefined budget categories
const BUDGET_CATEGORIES = [
  'Personnel',
  'Equipment',
  'Materials',
  'Travel',
  'Services',
  'Training',
  'Marketing',
  'Administrative',
  'Contingency',
  'Other'
];

export default function BudgetTab({ initialBudget = [], readOnly = false }: BudgetTabProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(
    initialBudget.length > 0 ? initialBudget : [
      {
        id: '1',
        category: '',
        description: '',
        amount: 0,
        quantity: 1,
        totalAmount: 0
      }
    ]
  );

  const [totalBudget, setTotalBudget] = useState<number>(0);

  // Calculate total budget whenever items change
  useEffect(() => {
    const total = budgetItems.reduce((sum, item) => sum + item.totalAmount, 0);
    setTotalBudget(total);
  }, [budgetItems]);

  // Add a new budget item
  const addBudgetItem = () => {
    const newId = (budgetItems.length + 1).toString();
    setBudgetItems([
      ...budgetItems,
      {
        id: newId,
        category: '',
        description: '',
        amount: 0,
        quantity: 1,
        totalAmount: 0
      }
    ]);
  };

  // Remove a budget item
  const removeBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  // Update budget item data
  const updateBudgetItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setBudgetItems(budgetItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total amount if quantity or amount changes
        if (field === 'amount' || field === 'quantity') {
          const amount = field === 'amount' ? (typeof value === 'number' ? value : parseFloat(value) || 0) : item.amount;
          const quantity = field === 'quantity' ? (typeof value === 'number' ? value : parseFloat(value) || 0) : item.quantity;
          updatedItem.totalAmount = amount * quantity;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Program Budget</h2>
          <p className="text-sm text-gray-500">Detailed budget breakdown for the program</p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addBudgetItem}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget Line
          </button>
        )}
      </div>

      {/* Total Budget Display */}
      <div className="bg-green-50 p-4 rounded-md border border-green-100">
        <div className="flex items-center">
          <Calculator className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-800">Total Budget</p>
            <p className="text-2xl font-bold text-green-900">₹{totalBudget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              {!readOnly && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {budgetItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={item.category}
                    onChange={(e) => updateBudgetItem(item.id, 'category', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={readOnly}
                  >
                    <option value="">Select a category</option>
                    {BUDGET_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateBudgetItem(item.id, 'description', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Line item description"
                    disabled={readOnly}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      value={item.amount || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        updateBudgetItem(item.id, 'amount', value);
                      }}
                      className="block w-full pl-7 border border-gray-300 rounded-md py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0.00"
                      disabled={readOnly}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      updateBudgetItem(item.id, 'quantity', value);
                    }}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="1"
                    min="1"
                    disabled={readOnly}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  ₹{item.totalAmount.toLocaleString()}
                </td>
                {!readOnly && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => removeBudgetItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={budgetItems.length === 1}
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
              <th colSpan={4} className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                Total
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                ₹{totalBudget.toLocaleString()}
              </th>
              {!readOnly && <th></th>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
