import { NextRequest, NextResponse } from 'next/server';
import { withStandardRateLimit, withAuthRateLimit, withSensitiveRateLimit } from '@/utils/rateLimiter';

/**
 * API Route Handler Middleware
 * This applies rate limiting to API routes based on their path pattern
 */
export function applyApiRateLimit(handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) {
  return async function middlewareHandler(req: NextRequest) {
    const { pathname } = new URL(req.url);
    
    // Apply stricter rate limits to authentication endpoints
    if (pathname.startsWith('/api/auth') || pathname.includes('login') || pathname.includes('register')) {
      return withAuthRateLimit(handler)(req);
    }
    
    // Apply very strict rate limits to sensitive operations
    if (
      pathname.includes('password-reset') || 
      pathname.includes('delete') || 
      pathname.includes('bulk-upload') ||
      pathname.includes('settings')
    ) {
      return withSensitiveRateLimit(handler)(req);
    }
    
    // Apply standard rate limits to all other API routes
    return withStandardRateLimit(handler)(req);
  };
}

/**
 * Helper decorators for common use cases
 */
export function withApiRateLimit<T extends (req: NextRequest) => Promise<NextResponse> | NextResponse>(handler: T): T {
  return applyApiRateLimit(handler) as T;
}

// Example usage in a route.ts file:
/*
import { withApiRateLimit } from '@/utils/apiRateLimit';

export const GET = withApiRateLimit(async function(req: NextRequest) {
  // Route implementation...
  return NextResponse.json({ success: true });
});
*/
