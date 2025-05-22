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
