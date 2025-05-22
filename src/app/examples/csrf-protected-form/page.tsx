'use client';

import React, { FormEvent, useState } from 'react';
import CsrfProtectedForm from '@/components/forms/CsrfProtectedForm';
import { getCsrfHeaders } from '@/utils/hooks/useCsrfToken';
import DashboardLayout from '@/components/DashboardLayout';

/**
 * Example page showing how to use the CSRF protected form
 */
export default function CsrfProtectedFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>, csrfToken: string) => {
    setIsSubmitting(true);
    setResult(null);
    
    try {
      // Use the CSRF token in the request headers
      const response = await fetch('/api/examples/secure-endpoint', {
        method: 'POST',
        headers: getCsrfHeaders(csrfToken),
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setResult({
        success: true,
        message: 'Form submitted successfully!'
      });
      
      // Clear form on success
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit form'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">CSRF Protected Form Example</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Contact Form (with CSRF Protection)</h2>
          
          <CsrfProtectedForm 
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Submitting...
                  </>
                ) : 'Submit Form'}
              </button>
            </div>
            
            {result && (
              <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              </div>
            )}
          </CsrfProtectedForm>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium mb-2">How CSRF Protection Works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>When this form loads, it automatically fetches a CSRF token from the server</li>
              <li>The token is stored in the component state and included in a hidden form field</li>
              <li>When you submit the form, the token is sent in the request headers</li>
              <li>The server verifies the token before processing the request</li>
              <li>If the token is invalid or missing, the request is rejected with a 403 Forbidden error</li>
            </ol>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
