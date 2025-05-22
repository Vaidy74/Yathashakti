import { NextRequest, NextResponse } from 'next/server';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { withCsrfProtection } from '@/utils/csrfProtection';
import { withValidation } from '@/utils/validation';
import { z } from 'zod';
import { IRateLimiterOptions } from 'rate-limiter-flexible';

/**
 * Higher-order function to create a fully secured API route handler with:
 * 1. Input validation via Zod
 * 2. CSRF protection for non-GET requests
 * 3. Rate limiting
 * 
 * @param handler - The API route handler
 * @param schema - Zod schema to validate the request body against
 * @param rateLimitOptions - Optional rate limiting configuration
 * @param skipCsrf - Optional flag to skip CSRF protection (for APIs that don't need it)
 * @returns A fully secured API route handler
 */
export function withSecureApiValidation<T extends z.ZodType>(
  handler: (req: NextRequest, validatedData: z.infer<T>, ...args: any[]) => Promise<NextResponse> | NextResponse,
  schema: T,
  rateLimitOptions?: Partial<IRateLimiterOptions>,
  skipCsrf = false
) {
  // First apply validation
  const validatedHandler = withValidation(handler, schema);
  
  // Then apply CSRF protection if needed
  const securedHandler = skipCsrf 
    ? validatedHandler 
    : withCsrfProtection(validatedHandler);
  
  // Finally apply rate limiting
  return withApiRateLimit(securedHandler, rateLimitOptions);
}

/**
 * Apply standard security for standard API endpoints
 */
export function withStandardSecureApi<T extends z.ZodType>(
  handler: (req: NextRequest, validatedData: z.infer<T>, ...args: any[]) => Promise<NextResponse> | NextResponse,
  schema: T,
  skipCsrf = false
) {
  const standardRateLimitOptions = {
    points: 60,     // 60 requests
    duration: 60,   // per minute
    blockDuration: 300, // 5 minutes block
  };
  
  return withSecureApiValidation(handler, schema, standardRateLimitOptions, skipCsrf);
}

/**
 * Apply stricter security for auth API endpoints
 */
export function withAuthSecureApi<T extends z.ZodType>(
  handler: (req: NextRequest, validatedData: z.infer<T>, ...args: any[]) => Promise<NextResponse> | NextResponse,
  schema: T,
  skipCsrf: boolean = false
) {
  const authRateLimitOptions = {
    points: 10,     // 10 requests
    duration: 60,   // per minute
    blockDuration: 300, // 5 minutes block
  };
  
  return withSecureApiValidation(handler, schema, authRateLimitOptions, skipCsrf);
}

/**
 * Apply very strict security for sensitive API endpoints
 */
export function withSensitiveSecureApi<T extends z.ZodType>(
  handler: (req: NextRequest, validatedData: z.infer<T>, ...args: any[]) => Promise<NextResponse> | NextResponse,
  schema: T,
  skipCsrf: boolean = false
) {
  const sensitiveRateLimitOptions = {
    points: 5,      // 5 requests
    duration: 60,   // per minute
    blockDuration: 600, // 10 minutes block
  };
  
  return withSecureApiValidation(handler, schema, sensitiveRateLimitOptions, skipCsrf);
}
