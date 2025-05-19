"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import RepaymentForm from '@/components/grants/RepaymentForm';
import { Grant } from '@/types/grant';

export default function RecordRepaymentPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  
  const [grant, setGrant] = useState<Grant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch grant data
  useEffect(() => {
    const fetchGrant = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/grants/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch grant: ${response.statusText}`);
        }
        
        const data = await response.json();
        setGrant(data);
      } catch (err) {
        console.error('Error fetching grant:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch grant data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchGrant();
    }
  }, [id]);
  
  // Handle successful repayment submission
  const handleSuccess = () => {
    // Navigate back to grant detail page
    router.push(`/grants/${id}`);
  };
  
  // Handle cancel
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Top Navigation */}
      <div className="mb-6">
        <Link 
          href={`/grants/${id}`} 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Grant Details
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Record Repayment</h1>
        <p className="mt-1 text-gray-500">
          Record a new repayment for this grant. All fields marked with * are required.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-500">Loading grant details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="mt-2 text-sm">
                <button 
                  onClick={() => router.back()} 
                  className="text-red-700 hover:text-red-600 font-medium"
                >
                  Go back
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : grant ? (
        <RepaymentForm 
          grant={grant} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Grant not found</p>
              <p className="mt-2 text-sm">
                <button 
                  onClick={() => router.back()} 
                  className="text-yellow-700 hover:text-yellow-600 font-medium"
                >
                  Go back
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
