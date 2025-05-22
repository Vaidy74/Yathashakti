import { NextRequest, NextResponse } from 'next/server';
import { Csrf } from 'csrf';
import { getIronSession } from 'iron-session';

// Iron session configuration
const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'yathashakti_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
  },
};

// Create CSRF tokens
const csrf = new Csrf();

/**
 * Get CSRF token from the request
 * @param req - The Next.js request object
 * @returns The CSRF token from the request headers or null if not found
 */
function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get the token from various locations
  return (
    req.headers.get('x-csrf-token') || 
    req.headers.get('x-xsrf-token') || 
    null
  );
}

/**
 * Generate a new CSRF token and save it to the session
 * @param req - The Next.js request object
 * @returns The generated CSRF token
 */
export async function generateToken(req: NextRequest): Promise<string> {
  const session = await getIronSession(req, new NextResponse(), sessionOptions);

  // Generate a new secret if one doesn't exist
  if (!session.csrfSecret) {
    session.csrfSecret = csrf.secretSync();
    await session.save();
  }

  // Generate a token from the secret
  return csrf.create(session.csrfSecret);
}

/**
 * Verify the CSRF token from the request
 * @param req - The Next.js request object
 * @returns True if the token is valid, false otherwise
 */
export async function verifyToken(req: NextRequest): Promise<boolean> {
  const token = getTokenFromRequest(req);
  if (!token) return false;

  const session = await getIronSession(req, new NextResponse(), sessionOptions);
  if (!session.csrfSecret) return false;

  return csrf.verify(session.csrfSecret, token);
}

/**
 * Middleware to protect routes from CSRF attacks
 * @param handler - The Next.js API route handler
 * @returns A wrapped handler with CSRF protection
 */
export function withCsrfProtection<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse>(
  handler: T
): T {
  return (async (req: NextRequest, ...args: any[]) => {
    // Only verify for state-changing methods
    const method = req.method.toUpperCase();
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

    if (isStateChanging) {
      const isValid = await verifyToken(req);
      if (!isValid) {
        return new NextResponse(JSON.stringify({
          error: 'Invalid or missing CSRF token',
          code: 'CSRF_ERROR'
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    return handler(req, ...args);
  }) as T;
}

/**
 * Create an API endpoint that provides a CSRF token
 * This endpoint should be called before submitting any form
 */
export async function csrfTokenHandler(req: NextRequest): Promise<NextResponse> {
  if (req.method !== 'GET') {
    return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET'
      }
    });
  }

  try {
    const token = await generateToken(req);
    return new NextResponse(JSON.stringify({ csrfToken: token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate CSRF token' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
