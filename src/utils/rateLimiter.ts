import { RateLimiterMemory, IRateLimiterOptions } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';

// Default configurations for different endpoint types
const defaultConfigs = {
  standard: {
    points: 60,  // 60 requests
    duration: 60 // per minute
  },
  auth: {
    points: 10,  // 10 requests
    duration: 60 // per minute
  },
  sensitive: {
    points: 5,   // 5 requests
    duration: 60 // per minute
  }
};

// Create rate limiters with the ability to override defaults
function createLimiter(type: 'standard' | 'auth' | 'sensitive', options?: Partial<IRateLimiterOptions>) {
  const baseConfig = defaultConfigs[type];
  return new RateLimiterMemory({
    ...baseConfig,
    ...options
  });
}

/**
 * Apply rate limiting to an API route handler
 * @param handler The Next.js API route handler
 * @param limiterType The type of rate limiter to use (standard, auth, sensitive)
 * @param options Optional overrides for the rate limiter configuration
 * @returns A wrapped handler with rate limiting applied
 */
export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse,
  limiterType: 'standard' | 'auth' | 'sensitive' = 'standard',
  options?: Partial<IRateLimiterOptions>
) {
  // Create a limiter with the specified type and options
  const limiter = createLimiter(limiterType, options);
  
  return async function rateLimit(req: NextRequest, ...args: any[]) {
    // Get client identifier (IP address or token if available)
    const ip = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              'unknown';
    
    try {
      // Consume points
      await limiter.consume(ip);
      // If successful, proceed with the original handler
      return handler(req, ...args);
    } catch (error) {
      // If rate limit exceeded
      return new NextResponse(JSON.stringify({
        error: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60' // Suggests client to retry after 60 seconds
        }
      });
    }
  };
}

/**
 * Helper function to create a rate-limited API route directly
 * @param limiterType The type of rate limiter to use
 * @param options Optional overrides for the rate limiter configuration
 * @returns A higher-order function that applies rate limiting to the provided handler
 */
export function createRateLimitedRoute(
  limiterType: 'standard' | 'auth' | 'sensitive' = 'standard',
  options?: Partial<IRateLimiterOptions>
) {
  return function<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse>(handler: T): T {
    return withRateLimit(handler, limiterType, options) as T;
  };
}

/**
 * Apply rate limiting to a route handler with standard limits
 * @param options Optional overrides for the rate limiter configuration
 */
export function withApiRateLimit<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse>(
  handler: T,
  options?: Partial<IRateLimiterOptions>
): T {
  return withRateLimit(handler, 'standard', options) as T;
}

/**
 * Apply stricter rate limiting to auth endpoints
 * @param options Optional overrides for the rate limiter configuration
 */
export function withAuthRateLimit<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse>(
  handler: T,
  options?: Partial<IRateLimiterOptions>
): T {
  return withRateLimit(handler, 'auth', options) as T;
}

/**
 * Apply very strict rate limiting to sensitive operations
 * @param options Optional overrides for the rate limiter configuration
 */
export function withSensitiveRateLimit<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse>(
  handler: T,
  options?: Partial<IRateLimiterOptions>
): T {
  return withRateLimit(handler, 'sensitive', options) as T;
}
