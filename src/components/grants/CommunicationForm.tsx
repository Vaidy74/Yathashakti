"use client";

import React, { useState } from 'react';
import { MessageCircle, Calendar, Phone, AlertCircle, User } from 'lucide-react';
import { Communication, CommunicationType, CommunicationFormData, CommunicationFormErrors, Grant, GrantStatus } from '@/types/grant';
import { toast } from 'react-hot-toast';

interface CommunicationFormProps {
  grant: Grant;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CommunicationForm({ grant, onSuccess, onCancel }: CommunicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [communicationDetails, setCommunicationDetails] = useState<CommunicationFormData>({
    date: new Date().toISOString().split('T')[0],
    type: CommunicationType.PHONE_CALL,
    notes: "",
    followUpDate: "",
    updateGrantStatus: false,
    newGrantStatus: grant.status
  });
  const [formErrors, setFormErrors] = useState<CommunicationFormErrors>({});

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: CommunicationFormErrors = {};
    
    if (!communicationDetails.date) {
      errors.date = "Communication date is required";
    }
    
    if (!communicationDetails.type) {
      errors.type = "Communication type is required";
    }
    
    if (!communicationDetails.notes || communicationDetails.notes.trim() === "") {
      errors.notes = "Communication notes are required";
    }
    
    if (communicationDetails.updateGrantStatus && !communicationDetails.newGrantStatus) {
      errors.general = "Please select a new grant status";
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
      
      // Make API request to log communication
      const response = await fetch(`/api/grants/${grant.id}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communicationDetails)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to log communication: ${response.statusText}`);
      }
      
      // Show success message
      toast.success('Communication logged successfully');
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error("Error logging communication:", err);
      setFormErrors({
        ...formErrors,
        general: err instanceof Error ? err.message : "Failed to log communication"
      });
      toast.error('Failed to log communication');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'communication_evidence');
    formData.append('entityId', grant.id);
    
    try {
      // Upload the file
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      
      // Update form with the evidence URL
      setCommunicationDetails({
        ...communicationDetails,
        evidence: data.url
      });
      
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-5 flex items-center">
        <MessageCircle className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">
          Log Communication
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
              <p className="text-sm font-medium text-gray-500">Current Status</p>
              <p className="mt-1 text-sm text-gray-900">{grant.status}</p>
            </div>
          </div>
        </div>
        
        {/* Communication Type Field */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Communication Type *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="type"
              name="type"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              value={communicationDetails.type}
              onChange={(e) => setCommunicationDetails({
                ...communicationDetails,
                type: e.target.value as CommunicationType
              })}
              required
            >
              {Object.values(CommunicationType).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          {formErrors.type && (
            <p className="mt-1 text-sm text-red-600">{formErrors.type}</p>
          )}
        </div>

        {/* Date Field */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Communication Date *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              name="date"
              id="date"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={communicationDetails.date}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              onChange={(e) => setCommunicationDetails({
                ...communicationDetails,
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
            Communication Notes *
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={5}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter details of the communication here..."
              value={communicationDetails.notes || ''}
              onChange={(e) => setCommunicationDetails({
                ...communicationDetails,
                notes: e.target.value
              })}
              required
            />
          </div>
          {formErrors.notes && (
            <p className="mt-1 text-sm text-red-600">{formErrors.notes}</p>
          )}
        </div>

        {/* Evidence Upload Field */}
        <div>
          <label htmlFor="evidence" className="block text-sm font-medium text-gray-700">
            Evidence (Optional)
          </label>
          <div className="mt-1">
            <input
              type="file"
              id="evidence"
              name="evidence"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              Upload photos, documents, or voice recordings related to this communication.
            </p>
          </div>
          {communicationDetails.evidence && (
            <div className="mt-2">
              <p className="text-sm text-green-600">File uploaded successfully</p>
            </div>
          )}
        </div>
        
        {/* Follow-up Date Field */}
        <div>
          <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700">
            Follow-up Date (Optional)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              name="followUpDate"
              id="followUpDate"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={communicationDetails.followUpDate || ''}
              min={new Date().toISOString().split('T')[0]} // Only allow future dates
              onChange={(e) => setCommunicationDetails({
                ...communicationDetails,
                followUpDate: e.target.value
              })}
            />
          </div>
        </div>

        {/* Update Grant Status Field */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-4">
            <input
              id="updateGrantStatus"
              name="updateGrantStatus"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={communicationDetails.updateGrantStatus}
              onChange={(e) => setCommunicationDetails({
                ...communicationDetails,
                updateGrantStatus: e.target.checked
              })}
            />
            <label htmlFor="updateGrantStatus" className="ml-2 block text-sm text-gray-700">
              Update grant status based on this communication?
            </label>
          </div>
          
          {communicationDetails.updateGrantStatus && (
            <div className="mt-2">
              <label htmlFor="newGrantStatus" className="block text-sm font-medium text-gray-700">
                New Grant Status
              </label>
              <select
                id="newGrantStatus"
                name="newGrantStatus"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={communicationDetails.newGrantStatus || ''}
                onChange={(e) => setCommunicationDetails({
                  ...communicationDetails,
                  newGrantStatus: e.target.value as GrantStatus
                })}
              >
                <option value="">Select new status</option>
                {Object.values(GrantStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Changing the grant status will update the grant's current status and may trigger additional workflows.
              </p>
            </div>
          )}
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
            {isSubmitting ? "Saving..." : "Log Communication"}
          </button>
        </div>
      </form>
    </div>
  );
}
