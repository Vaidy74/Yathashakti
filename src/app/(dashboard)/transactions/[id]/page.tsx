"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import TransactionDetailCard from "@/components/ledger/TransactionDetailCard";
import TransactionActions from "@/components/ledger/TransactionActions";
import {
  ArrowLeft,
  XCircle,
  Loader2
} from "lucide-react";
import { TransactionWithRelations, TransactionType, TransactionStatus } from "@/types/transaction";

export default function TransactionDetailPage() {
  const params = useParams();
  const { id } = params;

  const [transaction, setTransaction] = useState<TransactionWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // This function is intentionally left empty as we're now using the TransactionDetailCard component
  // which handles all the formatting and display logic internally

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/ledger" className="text-blue-600 hover:text-blue-800 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Transaction Details
            </h1>
          </div>
          
          {!isLoading && transaction && (
            <TransactionActions transactionId={transaction.id} />
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading transaction details...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
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
        )}

        {/* Transaction details */}
        {!isLoading && !error && transaction && (
          <TransactionDetailCard 
            transaction={transaction} 
            showActions={false} 
          />
        )}
        
        {/* Delete confirmation is now handled by the TransactionActions component */}
      </div>
    </DashboardLayout>
  );
}
