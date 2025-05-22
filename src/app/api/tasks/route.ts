import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema for task creation and update
const taskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional().nullable(),
  relatedProgramId: z.string().optional().nullable(),
  originatingMilestoneId: z.string().optional().nullable(),
});

// GET handler for retrieving tasks with filters
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters for filtering
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const relatedProgramId = searchParams.get('programId');
    const search = searchParams.get('search');
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
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
            title: true,
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
}

// POST handler for creating a new task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate the input data
    const validation = taskSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    // Parse date string to Date object if provided
    const taskData = validation.data;
    const dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null;

    // Create the task
    const task = await prisma.task.create({
      data: {
        ...taskData,
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
}
