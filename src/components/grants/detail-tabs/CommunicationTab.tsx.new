"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, Video, User, PlusCircle, Calendar, ArrowRight, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Communication, CommunicationType, Grant } from '@/types/grant';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface CommunicationTabProps {
  grant: Grant;
}

export default function CommunicationTab({ grant }: CommunicationTabProps) {
  const router = useRouter();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch communications from API
  const fetchCommunications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/grants/${grant.id}/communications`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch communications: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCommunications(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching communications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch communications');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch communications on component mount
  useEffect(() => {
    if (grant?.id) {
      fetchCommunications();
    }
  }, [grant?.id]);
  
  // Handle navigation to log communication page
  const handleAddCommunication = () => {
    router.push(`/grants/${grant.id}/log-communication`);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
  };
  
  // Get icon based on communication type
  const getCommunicationIcon = (type: CommunicationType) => {
    switch (type) {
      case CommunicationType.PHONE_CALL:
        return <Phone className="h-5 w-5 text-blue-500" />;
      case CommunicationType.EMAIL:
        return <Mail className="h-5 w-5 text-green-500" />;
      case CommunicationType.WHATSAPP_TEXT:
      case CommunicationType.SMS:
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case CommunicationType.WHATSAPP_VOICE:
        return <Phone className="h-5 w-5 text-green-500" />;
      case CommunicationType.IN_PERSON:
        return <User className="h-5 w-5 text-orange-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Communication Log</h3>
        <button 
          onClick={handleAddCommunication}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Log Communication
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                onClick={fetchCommunications}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-500">Loading communications...</span>
        </div>
      ) : (
        <>
          {/* Communication List */}
          <div className="space-y-4">
            {communications.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No communications recorded</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new communication log entry.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleAddCommunication}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Log Communication
                  </button>
                </div>
              </div>
            ) : (
              communications.map((comm) => (
                <div key={comm.id} className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getCommunicationIcon(comm.type)}
                        <p className="ml-2 text-sm font-medium text-gray-900">
                          {comm.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <time dateTime={comm.date}>{formatDate(comm.date)}</time>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">{comm.notes}</p>
                    </div>
                    {comm.evidence && (
                      <div className="mt-3 flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-1 text-blue-500" />
                        <a href={comm.evidence} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          View attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
