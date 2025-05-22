import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { validateBody, validateQuery, createValidationErrorResponse } from '@/utils/validation';
import { withApiRateLimit } from '@/utils/apiRateLimit';

// Create schemas for task validation
const taskCreateSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional().nullable(),
  relatedProgramId: z.string().optional().nullable(),
  originatingMilestoneId: z.string().optional().nullable(),
});

// Schema for query parameters
const taskQuerySchema = z.object({
  assigneeId: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  programId: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

// GET handler for retrieving tasks with filters
export const GET = withApiRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate query parameters
    const [isValid, queryParams, validationError] = validateQuery(request, taskQuerySchema);
    
    if (!isValid) {
      // Return validation error if query parameters are invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    
    // Extract validated parameters
    const {
      assigneeId,
      status,
      priority,
      programId: relatedProgramId,
      search,
      page = 1,
      limit = 10
    } = queryParams || {};
    
    const skip = (page - 1) * limit;

    // Build filter object
    const where: any = {};
    
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (relatedProgramId) where.relatedProgramId = relatedProgramId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.task.count({ where });

    // Get tasks with pagination and include related entities
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        originatingMilestone: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      tasks,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
});

// POST handler for creating a new task
export const POST = withApiRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const [isValid, validatedData, validationError] = await validateBody(request, taskCreateSchema);
    
    if (!isValid) {
      // Return validation error if body is invalid
      if (validationError) {
        return createValidationErrorResponse(validationError);
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Parse date string to Date object if provided
    const dueDate = validatedData?.dueDate ? new Date(validatedData.dueDate) : null;

    // Create the task
    const task = await prisma.task.create({
      data: {
        ...(validatedData as any),
        dueDate,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
});

