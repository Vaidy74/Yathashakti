/**
 * Pagination utilities for standardizing server-side pagination across the application
 */
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Standard Zod schema for pagination parameters
 * Can be extended with additional filters specific to each API
 */
export const paginationQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

/**
 * Type for pagination parameters
 */
export type PaginationParams = {
  page: number;
  limit: number;
};

/**
 * Type for pagination metadata in responses
 */
export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Type for paginated API responses
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

/**
 * Extract pagination parameters from a NextRequest
 * @param request NextRequest object
 * @returns Pagination parameters with defaults
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 ? 10 : (limit > 100 ? 100 : limit),
  };
}

/**
 * Calculate skip value for database queries
 * @param page Page number (1-based)
 * @param limit Items per page
 * @returns Skip value for database query
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Create pagination metadata for response
 * @param total Total number of items
 * @param page Current page number
 * @param limit Items per page
 * @returns Pagination metadata object
 */
export function createPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Create a standardized paginated response
 * @param data Array of data items
 * @param total Total count of items in database
 * @param page Current page number
 * @param limit Items per page
 * @returns Standardized paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(total, page, limit)
  };
}

/**
 * Create an error response for pagination errors
 * @param message Error message
 * @param status HTTP status code
 * @returns NextResponse with error details
 */
export function createPaginationErrorResponse(
  message: string = 'Invalid pagination parameters',
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
