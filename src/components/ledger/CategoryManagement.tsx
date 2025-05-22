"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  AlertCircle
} from "lucide-react";
import { TransactionCategory, TransactionType } from "@/types/transaction";

interface CategoryManagementProps {
  onClose: () => void;
}

export default function CategoryManagement({ onClose }: CategoryManagementProps) {
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [editingCategory, setEditingCategory] = useState<{ index: number; value: string; type: TransactionType } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        // Split categories by type
        const income = data.filter((cat: any) => cat.type === TransactionType.INCOME)
          .map((cat: any) => cat.name);
        const expense = data.filter((cat: any) => cat.type === TransactionType.EXPENSE)
          .map((cat: any) => cat.name);
        
        setIncomeCategories(income);
        setExpenseCategories(expense);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.trim(),
          type: selectedType
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add category');
      }
      
      const addedCategory = await response.json();
      
      if (selectedType === TransactionType.INCOME) {
        setIncomeCategories([...incomeCategories, addedCategory.name]);
      } else {
        setExpenseCategories([...expenseCategories, addedCategory.name]);
      }
      
      setNewCategory("");
      setError(null);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.value.trim()) return;
    
    try {
      setLoading(true);
      const categories = editingCategory.type === TransactionType.INCOME 
        ? incomeCategories 
        : expenseCategories;
      const oldName = categories[editingCategory.index];
      
      const response = await fetch(`/api/categories/${encodeURIComponent(oldName)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCategory.value.trim(),
          type: editingCategory.type
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      if (editingCategory.type === TransactionType.INCOME) {
        const updatedCategories = [...incomeCategories];
        updatedCategories[editingCategory.index] = editingCategory.value.trim();
        setIncomeCategories(updatedCategories);
      } else {
        const updatedCategories = [...expenseCategories];
        updatedCategories[editingCategory.index] = editingCategory.value.trim();
        setExpenseCategories(updatedCategories);
      }
      
      setEditingCategory(null);
      setError(null);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (index: number, type: TransactionType) => {
    try {
      setLoading(true);
      const categories = type === TransactionType.INCOME 
        ? incomeCategories 
        : expenseCategories;
      const categoryName = categories[index];
      
      const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}?type=${type}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      if (type === TransactionType.INCOME) {
        const updatedCategories = incomeCategories.filter((_, i) => i !== index);
        setIncomeCategories(updatedCategories);
      } else {
        const updatedCategories = expenseCategories.filter((_, i) => i !== index);
        setExpenseCategories(updatedCategories);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a category
  const startEditCategory = (index: number, type: TransactionType) => {
    const categories = type === TransactionType.INCOME 
      ? incomeCategories 
      : expenseCategories;
    setEditingCategory({
      index,
      value: categories[index],
      type
    });
  };

  // Render category list items
  const renderCategoryItems = (categories: string[], type: TransactionType) => {
    return categories.map((category, index) => (
      <li 
        key={`${type}-${index}`}
        className="flex items-center justify-between py-2 px-4 hover:bg-gray-50"
      >
        {editingCategory && 
          editingCategory.index === index && 
          editingCategory.type === type ? (
          <div className="flex items-center space-x-2 w-full">
            <input
              type="text"
              value={editingCategory.value}
              onChange={(e) => setEditingCategory({
                ...editingCategory,
                value: e.target.value
              })}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              autoFocus
            />
            <button
              onClick={handleUpdateCategory}
              className="text-green-600 hover:text-green-800"
              disabled={loading}
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              onClick={() => setEditingCategory(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-gray-700">{category}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => startEditCategory(index, type)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteCategory(index, type)}
                className="text-red-600 hover:text-red-800"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </li>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="bg-blue-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Manage Transaction Categories</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
          <div className="flex items-center space-x-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TransactionType)}
              className="block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value={TransactionType.INCOME}>Income</option>
              <option value={TransactionType.EXPENSE}>Expense</option>
            </select>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="block flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter category name"
            />
            <button
              onClick={handleAddCategory}
              disabled={loading || !newCategory.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <span className="inline-block h-3 w-3 bg-green-500 rounded-full mr-2"></span>
              Income Categories
            </h3>
            {loading && incomeCategories.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">Loading categories...</p>
            ) : incomeCategories.length > 0 ? (
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {renderCategoryItems(incomeCategories, TransactionType.INCOME)}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm py-4">No income categories defined yet.</p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <span className="inline-block h-3 w-3 bg-red-500 rounded-full mr-2"></span>
              Expense Categories
            </h3>
            {loading && expenseCategories.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">Loading categories...</p>
            ) : expenseCategories.length > 0 ? (
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {renderCategoryItems(expenseCategories, TransactionType.EXPENSE)}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm py-4">No expense categories defined yet.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 flex justify-end">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}
