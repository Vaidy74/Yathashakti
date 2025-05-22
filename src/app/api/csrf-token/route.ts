import { NextRequest } from 'next/server';
import { csrfTokenHandler } from '@/utils/csrfProtection';
import { withApiRateLimit } from '@/utils/apiRateLimit';

// Rate limiter options for CSRF token requests
const csrfRateLimitOptions = {
  points: 30,    // 30 requests
  duration: 60,  // per minute
  blockDuration: 300 // 5 minutes block after too many requests
};

// GET handler for obtaining a CSRF token
export const GET = withApiRateLimit(async function GET(req: NextRequest) {
  return csrfTokenHandler(req);
}, csrfRateLimitOptions);
