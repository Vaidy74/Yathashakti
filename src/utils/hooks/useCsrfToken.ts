'use client';

import { useState, useEffect } from 'react';

/**
 * React hook to fetch and manage CSRF tokens for form submissions
 * @returns An object containing the CSRF token and loading/error states
 */
export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a new CSRF token
  const fetchToken = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/csrf-token');
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch CSRF token');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token on component mount
  useEffect(() => {
    fetchToken();
  }, []);

  // Refresh the token
  const refreshToken = () => {
    fetchToken();
  };

  return {
    csrfToken,
    isLoading,
    error,
    refreshToken
  };
}

/**
 * Get headers with CSRF token for fetch requests
 * @param csrfToken - The CSRF token to include in the headers
 * @param additionalHeaders - Any additional headers to include
 * @returns Headers object with CSRF token and additional headers
 */
export function getCsrfHeaders(csrfToken: string | null, additionalHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
}
