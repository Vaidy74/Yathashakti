import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateBody, validateQuery, createValidationErrorResponse } from '@/utils/validation';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { withCsrfProtection } from '@/utils/csrfProtection';

/**
 * Example API endpoint demonstrating comprehensive validation using Zod
 * This shows how to:
 * 1. Define schemas for request validation
 * 2. Validate both query parameters and request bodies
 * 3. Combine validation with rate limiting and CSRF protection
 * 4. Return formatted validation error responses
 */

// Schema for query parameters (for GET requests)
const queryParamsSchema = z.object({
  // String parameters with validation
  name: z.string().optional(),
  category: z.string().optional(),
  
  // Numeric parameters with transformation and validation
  page: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : 1)
    .pipe(z.number().positive().int()),
  
  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : 10)
    .pipe(z.number().positive().max(100).int()),
    
  // Boolean parameters with transformation
  includeArchived: z.string()
    .optional()
    .transform(val => val === 'true')
    .pipe(z.boolean()),
    
  // Date parameters with validation
  fromDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format'
    }),
});

// Schema for the POST request body
const createItemSchema = z.object({
  // Required fields with validation
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  description: z.string().max(500).optional(),
  
  // Enum values
  type: z.enum(['TASK', 'NOTE', 'REMINDER']),
  
  // Numeric fields with validation
  priority: z.number().int().min(1).max(5),
  
  // Array fields with item validation
  tags: z.array(z.string()).max(10).optional(),
  
  // Nested objects with their own validation
  metadata: z.object({
    createdBy: z.string().uuid().optional(),
    source: z.string().optional(),
    isPublic: z.boolean().default(false),
  }).optional(),
  
  // Date fields
  dueDate: z.string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format'
    })
    .optional(),
});

// GET handler with query parameter validation
export const GET = withApiRateLimit(async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const [isValid, queryParams, validationError] = validateQuery(request, queryParamsSchema);
    
    if (!isValid) {
      // Return validation error if query parameters are invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    
    // Use the validated query parameters
    const { name, category, page, limit, includeArchived, fromDate } = queryParams || {};
    
    // Log the validated parameters (for demonstration purposes)
    console.log('Validated parameters:', { name, category, page, limit, includeArchived, fromDate });
    
    // Your business logic here...
    
    return NextResponse.json({
      message: 'Validation successful',
      params: queryParams,
      results: [
        { id: 1, name: 'Example Item 1' },
        { id: 2, name: 'Example Item 2' },
      ],
      pagination: {
        page,
        limit,
        total: 2,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error in validation demo GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST handler with request body validation and CSRF protection
export const POST = withApiRateLimit(withCsrfProtection(async function POST(request: NextRequest) {
  try {
    // Validate request body
    const [isValid, validatedData, validationError] = await validateBody(request, createItemSchema);
    
    if (!isValid) {
      // Return validation error if body is invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Use the validated data for business logic
    console.log('Validated data:', validatedData);
    
    // Process dates if needed
    const dueDate = validatedData?.dueDate ? new Date(validatedData.dueDate) : null;
    
    // Your business logic here...
    
    return NextResponse.json({
      message: 'Item created successfully',
      item: {
        id: Math.floor(Math.random() * 1000), // For demo purposes
        ...validatedData,
        dueDate,
        createdAt: new Date().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in validation demo POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}));

// PUT handler with request body validation and CSRF protection
export const PUT = withApiRateLimit(withCsrfProtection(async function PUT(request: NextRequest) {
  try {
    // For PUT requests, we can use the same schema but make all fields optional
    const updateItemSchema = createItemSchema.partial();
    
    // Validate request body
    const [isValid, validatedData, validationError] = await validateBody(request, updateItemSchema);
    
    if (!isValid) {
      // Return validation error if body is invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Use the validated data for business logic
    console.log('Validated update data:', validatedData);
    
    // Your business logic here...
    
    return NextResponse.json({
      message: 'Item updated successfully',
      item: {
        id: 1, // For demo purposes
        ...validatedData,
        updatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error in validation demo PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}));
