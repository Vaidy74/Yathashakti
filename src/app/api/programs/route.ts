import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';
import { withApiRateLimit } from '@/utils/apiRateLimit';
import { validateQuery, validateBody, createValidationErrorResponse } from '@/utils/validation';
import { paginationQuerySchema, calculateSkip, createPaginatedResponse } from '@/utils/pagination';

// Schema for program query parameters, extending the pagination schema
const programQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.string().optional()
});

// GET - Retrieve all programs with pagination and filtering
export const GET = withApiRateLimit(async (request: NextRequest) => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Validate query parameters
    const [isValid, queryParams, validationError] = validateQuery(request, programQuerySchema);
    
    if (!isValid) {
      // Return validation error if query parameters are invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Extract validated parameters
    const {
      search = '',
      status = '',
      categoryId = '',
      page = 1,
      limit = 10
    } = queryParams || {};
    
    // Calculate pagination
    const skip = calculateSkip(page, limit);
    
    // Build filters
    const filters: any = {};
    
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (categoryId) {
      filters.categoryId = categoryId;
    }
    
    // Get total count for pagination
    const totalCount = await prisma.program.count({
      where: filters
    });
    
    // Get programs with proper pagination
    const programs = await prisma.program.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        category: true,
        teamMembers: {
          include: {
            user: true
          }
        },
        milestones: true,
        sdgGoals: true,
        grants: true,
        serviceProviders: {
          include: {
            serviceProvider: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Return standardized paginated response
    return NextResponse.json(
      createPaginatedResponse(programs, totalCount, page, limit)
    );
    
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
});

// Schema for creating a new program
const programCreateSchema = z.object({
  name: z.string().min(1, { message: "Program name is required" }),
  description: z.string().optional(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  status: z.string().default('ACTIVE'),
  budget: z.number().nonnegative().default(0),
  categoryId: z.string().optional(),
  teamMembers: z.array(z.string()).optional(),
  sdgGoals: z.array(z.string()).optional()
});

// POST - Create a new program
export const POST = withApiRateLimit(async (request: NextRequest) => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Validate request body
    const [isValid, validatedData, validationError] = await validateBody(request, programCreateSchema);
    
    if (!isValid) {
      // Return validation error if body is invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    if (!validatedData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }
    
    // Extract validated fields
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      status = 'ACTIVE', 
      budget = 0,
      categoryId,
      teamMembers = [],
      sdgGoals = []
    } = validatedData;
    
    // Create program
    const program = await prisma.program.create({
      data: {
        name,
        description,
        startDate,
        endDate,
        budget,
        status,
        category: categoryId ? {
          connect: { id: categoryId }
        } : undefined,
        teamMembers: {
          create: teamMembers.map((memberId: string) => ({
            user: { connect: { id: memberId } }
          })) || []
        },
        sdgGoals: {
          create: sdgGoals.map((goalId: string) => ({
            sdgGoal: { connect: { id: goalId } }
          })) || []
        }
      }
    });
    
    return NextResponse.json(program);
    
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
});
