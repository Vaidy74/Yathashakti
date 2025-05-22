'use client';

import React, { FormEvent, ReactNode } from 'react';
import { useCsrfToken } from '@/utils/hooks/useCsrfToken';

interface CsrfProtectedFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>, csrfToken: string) => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * A form component that automatically includes CSRF protection
 * This component fetches a CSRF token and includes it in form submissions
 */
const CsrfProtectedForm: React.FC<CsrfProtectedFormProps> = ({
  onSubmit,
  children,
  className = '',
  id,
}) => {
  const { csrfToken, isLoading, error, refreshToken } = useCsrfToken();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!csrfToken) {
      console.error('Missing CSRF token, attempting to refresh');
      refreshToken();
      return;
    }
    
    onSubmit(e, csrfToken);
  };

  return (
    <form onSubmit={handleSubmit} className={className} id={id}>
      {/* Hidden input for CSRF token */}
      <input type="hidden" name="csrfToken" value={csrfToken || ''} />
      
      {/* Show error if token fetch failed */}
      {error && (
        <div className="p-2 text-sm text-red-700 bg-red-100 rounded-md mb-4">
          Error loading security token: {error}. Please refresh the page.
        </div>
      )}
      
      {/* Show loading state while fetching token */}
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          <span className="text-gray-500">Loading security token...</span>
        </div>
      ) : (
        /* Render form contents once token is loaded */
        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          {children}
        </div>
      )}
    </form>
  );
};

export default CsrfProtectedForm;
