/**
 * Test utility functions to bypass security features during testing
 */

import { NextRequest, NextResponse } from 'next/server';

type HandlerFunction = (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse;

/**
 * Mocks for our security utilities to use in tests
 */

// Mock rate limiting for tests - bypasses rate limiting checks
export function mockWithApiRateLimit(handler: HandlerFunction): HandlerFunction {
  return handler;
}

// Mock handler for Next.js Route Handlers (which are objects with a wrapped handler function)
export function mockHandler(routeHandler: any): HandlerFunction {
  // If the handler is already a function, just return it
  if (typeof routeHandler === 'function') {
    return routeHandler;
  }
  
  // For Next.js App Router route handlers with rate limiting,
  // we need to get the original function that was passed to withApiRateLimit
  // The structure is typically a function that has a closure over the original handler
  return async function unwrappedHandler(req: NextRequest, ...args: any[]) {
    // Just call the wrapped handler directly, bypassing rate limiting
    try {
      if (routeHandler.hasOwnProperty('rateLimit')) {
        // If we can identify a rate-limited handler by its property
        return await routeHandler(req, ...args);
      } else {
        // Default fallback - just call the function directly
        return await routeHandler(req, ...args);
      }
    } catch (error) {
      console.error('Error in mockHandler:', error);
      return NextResponse.json({ error: 'Test error' }, { status: 500 });
    }
  };
}

// Mock CSRF protection for tests - bypasses CSRF validation
export function mockWithCsrfProtection(handler: HandlerFunction): HandlerFunction {
  return handler;
}

// Mock validation for tests - bypasses input validation
export function mockValidateBody(): [boolean, any, null] {
  return [true, {}, null];
}

export function mockValidateQuery(): [boolean, any, null] {
  return [true, {}, null];
}

/**
 * Jest mocks for security modules - for use in jest.setup.js only
 * This is only used as a reference and should not be directly imported in tests
 */
export const securityMocksReference = {
  apiRateLimit: {
    withApiRateLimit: (handler: HandlerFunction): HandlerFunction => handler,
    applyApiRateLimit: (handler: HandlerFunction): HandlerFunction => handler
  },
  csrfProtection: {
    withCsrfProtection: (handler: HandlerFunction): HandlerFunction => handler,
    csrfTokenHandler: (): NextResponse => NextResponse.json({ csrfToken: 'test-token' })
  },
  validation: {
    validateBody: (): [boolean, any, null] => [true, {}, null],
    validateQuery: (): [boolean, any, null] => [true, {}, null],
    createValidationErrorResponse: (): NextResponse => NextResponse.json({ error: 'Validation error' }, { status: 400 })
  },
  secureApiRoute: {
    withSecureApi: (handler: HandlerFunction): HandlerFunction => handler,
    withSecureAuthApi: (handler: HandlerFunction): HandlerFunction => handler,
    withSecureSensitiveApi: (handler: HandlerFunction): HandlerFunction => handler
  }
};
