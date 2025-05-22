import { NextRequest, NextResponse } from 'next/server';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { withCsrfProtection } from '@/utils/csrfProtection';
import { IRateLimiterOptions } from 'rate-limiter-flexible';

/**
 * Apply both rate limiting and CSRF protection to an API route handler
 * @param handler The Next.js API route handler
 * @param rateLimitOptions Optional rate limiting configuration options
 * @returns A wrapped handler with rate limiting and CSRF protection
 */
export function withSecureApi<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse>(
  handler: T,
  rateLimitOptions?: Partial<IRateLimiterOptions>
): T {
  // Apply rate limiting first, then CSRF protection
  return withApiRateLimit(withCsrfProtection(handler), rateLimitOptions) as T;
}

/**
 * Apply both rate limiting with stricter limits and CSRF protection to auth endpoints
 * @param handler The Next.js API route handler
 * @param rateLimitOptions Optional rate limiting configuration options
 * @returns A wrapped handler with rate limiting and CSRF protection
 */
export function withSecureAuthApi<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse>(
  handler: T,
  rateLimitOptions?: Partial<IRateLimiterOptions>
): T {
  // Apply auth rate limiting with stricter limits
  const securedHandler = withApiRateLimit(handler, {
    points: 10,     // 10 requests
    duration: 60,   // per minute
    blockDuration: 300, // 5 minutes block
    ...rateLimitOptions
  });
  
  // Then apply CSRF protection
  return withCsrfProtection(securedHandler) as T;
}

/**
 * Apply both rate limiting with very strict limits and CSRF protection to sensitive operations
 * @param handler The Next.js API route handler
 * @param rateLimitOptions Optional rate limiting configuration options
 * @returns A wrapped handler with rate limiting and CSRF protection
 */
export function withSecureSensitiveApi<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse>(
  handler: T,
  rateLimitOptions?: Partial<IRateLimiterOptions>
): T {
  // Apply sensitive rate limiting with very strict limits
  const securedHandler = withApiRateLimit(handler, {
    points: 5,      // 5 requests
    duration: 60,   // per minute
    blockDuration: 600, // 10 minutes block
    ...rateLimitOptions
  });
  
  // Then apply CSRF protection
  return withCsrfProtection(securedHandler) as T;
}
