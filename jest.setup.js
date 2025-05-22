// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock our security modules for tests
jest.mock('@/utils/apiRateLimit', () => ({
  withApiRateLimit: jest.fn(handler => handler),
  applyApiRateLimit: jest.fn(handler => handler)
}));

jest.mock('@/utils/csrfProtection', () => ({
  withCsrfProtection: jest.fn(handler => handler),
  csrfTokenHandler: jest.fn(() => ({ json: jest.fn() }))
}));

jest.mock('@/utils/validation', () => ({
  validateBody: jest.fn(() => [true, {}, null]),
  validateQuery: jest.fn(() => [true, {}, null]),
  createValidationErrorResponse: jest.fn(() => ({ json: jest.fn() }))
}));

jest.mock('@/utils/secureApiRoute', () => ({
  withSecureApi: jest.fn(handler => handler),
  withSecureAuthApi: jest.fn(handler => handler),
  withSecureSensitiveApi: jest.fn(handler => handler)
}));

jest.mock('@/utils/secureApiWithValidation', () => ({
  withSecureApiValidation: jest.fn(handler => handler),
  withStandardSecureApi: jest.fn(handler => handler),
  withAuthSecureApi: jest.fn(handler => handler),
  withSensitiveSecureApi: jest.fn(handler => handler)
}));
