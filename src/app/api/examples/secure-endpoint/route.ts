import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withSecureApi } from '@/utils/secureApiRoute';

/**
 * Example of a secure API endpoint with both rate limiting and CSRF protection
 * Use this pattern for all form-handling endpoints
 */

// GET handler - No CSRF needed, but still rate limited
export const GET = withSecureApi(async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Secure data retrieved successfully' });
  } catch (error) {
    console.error('Error in secure endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST handler - CSRF protected and rate limited
export const POST = withSecureApi(async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Process the data...
    console.log('Processing secure data with CSRF protection', data);
    
    return NextResponse.json({ 
      message: 'Secure form submission processed successfully',
      received: data
    }, { status: 201 });
  } catch (error) {
    console.error('Error in secure endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
