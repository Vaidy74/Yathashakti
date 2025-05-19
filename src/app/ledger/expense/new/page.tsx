"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, ArrowDownLeft, ChevronLeft, AlertCircle } from "lucide-react";
import TransactionForm from "@/components/ledger/TransactionForm";

export default function AddExpensePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      console.log("Submitting expense transaction:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after delay
      setTimeout(() => {
        router.push("/ledger");
      }, 2000);
    } catch (err) {
      console.error("Error recording expense:", err);
      setError("Failed to record expense transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/ledger" 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Ledger
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ArrowDownLeft className="h-6 w-6 mr-2 text-red-500" />
            Add New Expense
          </h1>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-green-400" />
            <span>Expense transaction recorded successfully! Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Expense Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Record a new expense transaction for your organization.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <TransactionForm type="expense" onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
