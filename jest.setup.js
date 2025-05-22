// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { NextRequest, NextResponse } from 'next/server';

// Create a helper for wrapping handlers
const wrapHandler = (handler) => {
  // For Next.js App Router route handlers, we need to return a new function
  // that will be used as the handler, but we want to maintain any properties
  const wrapped = async (...args) => {
    return handler(...args);
  };
  
  // Make the wrapped function look like a rate-limited handler
  wrapped.__rateLimit = true;
  
  return wrapped;
};

// Mock our security modules for tests
jest.mock('@/utils/apiRateLimit', () => ({
  withApiRateLimit: jest.fn(handler => wrapHandler(handler)),
  applyApiRateLimit: jest.fn(handler => wrapHandler(handler))
}));

jest.mock('@/utils/csrfProtection', () => ({
  withCsrfProtection: jest.fn(handler => wrapHandler(handler)),
  csrfTokenHandler: jest.fn(() => NextResponse.json({ csrfToken: 'mock-token' }, { status: 200 }))
}));

jest.mock('@/utils/validation', () => ({
  validateBody: jest.fn(() => [true, {}, null]),
  validateQuery: jest.fn(() => [true, {}, null]),
  createValidationErrorResponse: jest.fn(() => NextResponse.json({ error: 'Validation error' }, { status: 400 }))
}));

jest.mock('@/utils/secureApiRoute', () => ({
  withSecureApi: jest.fn(handler => wrapHandler(handler)),
  withSecureAuthApi: jest.fn(handler => wrapHandler(handler)),
  withSecureSensitiveApi: jest.fn(handler => wrapHandler(handler))
}));

jest.mock('@/utils/secureApiWithValidation', () => ({
  withSecureApiValidation: jest.fn(handler => wrapHandler(handler)),
  withStandardSecureApi: jest.fn(handler => wrapHandler(handler)),
  withAuthSecureApi: jest.fn(handler => wrapHandler(handler)),
  withSensitiveSecureApi: jest.fn(handler => wrapHandler(handler))
}));

// Mock FormData for tests since it's not available in the Jest environment
global.FormData = class FormData {
  constructor() {
    this.data = {};
  }
  
  append(key, value) {
    this.data[key] = value;
  }
  
  get(key) {
    return this.data[key] || null;
  }
};

// Mock File and Blob for tests
global.File = class File {
  constructor(content, name, options = {}) {
    this.content = content;
    this.name = name;
    this.type = options.type || '';
    this.size = content.length || 0;
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
};

global.Blob = class Blob {
  constructor(content, options = {}) {
    this.content = content;
    this.type = options.type || '';
    this.size = content.length || 0;
  }
};
