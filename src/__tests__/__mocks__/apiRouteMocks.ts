/**
 * Mocks for API routes in tests
 * 
 * This file provides mocks for all API route handlers that use security features,
 * ensuring tests can run properly without being affected by rate limiting,
 * CSRF protection, or validation.
 */

import { GET as TasksGET, POST as TasksPOST } from '@/app/api/tasks/route';
import { mockWithApiRateLimit } from '@/utils/testHelpers';

// Export original route handlers wrapped with test mocks to bypass security
export const mockTasksAPI = {
  GET: mockWithApiRateLimit(TasksGET),
  POST: mockWithApiRateLimit(TasksPOST)
};

// Add other API route mocks as needed for future tests
