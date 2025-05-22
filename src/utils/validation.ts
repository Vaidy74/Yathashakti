import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates request data against a Zod schema
 * @param req The request object
 * @param schema Zod schema to validate against
 * @returns A tuple containing [isValid, data, errors]
 */
export async function validateBody<T extends z.ZodType>(
  req: NextRequest | Request,
  schema: T
): Promise<[boolean, z.infer<T> | null, z.ZodError | null]> {
  try {
    const body = await req.json();
    const result = await schema.safeParseAsync(body);
    
    if (result.success) {
      return [true, result.data, null];
    } else {
      return [false, null, result.error];
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return [false, null, null];
  }
}

/**
 * Validates URL search params against a Zod schema
 * @param req The request object
 * @param schema Zod schema to validate against
 * @returns A tuple containing [isValid, data, errors]
 */
export function validateQuery<T extends z.ZodType>(
  req: NextRequest | Request,
  schema: T
): [boolean, z.infer<T> | null, z.ZodError | null] {
  try {
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    const result = schema.safeParse(queryParams);
    
    if (result.success) {
      return [true, result.data, null];
    } else {
      return [false, null, result.error];
    }
  } catch (error) {
    console.error('Error parsing query parameters:', error);
    return [false, null, null];
  }
}

/**
 * Creates a validation error response from a Zod error
 * @param error Zod validation error
 * @returns NextResponse with formatted error details
 */
export function createValidationErrorResponse(error: z.ZodError): NextResponse {
  const formattedErrors = error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
  
  return NextResponse.json(
    {
      error: 'Validation Error',
      details: formattedErrors
    },
    { status: 400 }
  );
}

/**
 * Common validation schemas for reuse across the application
 */
export const Schemas = {
  // User-related schemas
  User: {
    create: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      role: z.enum(['USER', 'SUPER_ADMIN', 'PROGRAM_MANAGER', 'SERVICE_PROVIDER']),
      organizationId: z.string().optional(),
    }),
    update: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      email: z.string().email('Invalid email address').optional(),
      role: z.enum(['USER', 'SUPER_ADMIN', 'PROGRAM_MANAGER', 'SERVICE_PROVIDER']).optional(),
      organizationId: z.string().optional(),
    }),
  },
  
  // Task-related schemas
  Task: {
    create: z.object({
      title: z.string().min(3, 'Title must be at least 3 characters'),
      description: z.string().optional(),
      dueDate: z.string().datetime({ offset: true }),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
      assignedToId: z.string().optional(),
    }),
    update: z.object({
      title: z.string().min(3, 'Title must be at least 3 characters').optional(),
      description: z.string().optional(),
      dueDate: z.string().datetime({ offset: true }).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
      assignedToId: z.string().optional(),
    }),
  },
  
  // Notification settings schema
  NotificationSettings: z.object({
    emailTaskReminders: z.boolean(),
    inAppTaskReminders: z.boolean(),
    emailRepaymentReminders: z.boolean(),
    inAppRepaymentReminders: z.boolean(),
    emailGrantUpdates: z.boolean(),
    inAppGrantUpdates: z.boolean(),
    emailProgramUpdates: z.boolean(),
    inAppProgramUpdates: z.boolean(),
    reminderLeadTime: z.number().int().min(1).max(72),
  }),
  
  // Query parameter schemas
  Pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
  }),
  
  // Sorting schema
  Sorting: z.object({
    sortBy: z.string(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
};
