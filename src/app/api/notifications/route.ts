import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema for request validation
const notificationSchema = z.object({
  type: z.enum([
    'TASK_REMINDER',
    'TASK_ASSIGNED',
    'TASK_COMPLETED',
    'TASK_COMMENTED',
    'REPAYMENT_DUE',
    'REPAYMENT_OVERDUE',
    'GRANT_STATUS_UPDATE',
    'PROGRAM_UPDATE',
    'SYSTEM_MESSAGE'
  ]),
  title: z.string().min(3),
  message: z.string().min(3),
  recipientId: z.string(),
  senderId: z.string().optional(),
  relatedEntityId: z.string().optional(),
  relatedEntityType: z.string().optional(),
  taskId: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
});

// GET - Fetch notifications for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build the where clause
    const where = {
      recipientId: session.user.id,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    // Get total count for pagination
    const totalCount = await prisma.notification.count({ where });

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST - Create a new notification
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate request data
    const validation = notificationSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const notificationData = validation.data;

    // Parse expiresAt if it exists
    const expiresAt = notificationData.expiresAt ? new Date(notificationData.expiresAt) : null;

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        ...notificationData,
        expiresAt,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PATCH - Mark all notifications as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const markAll = searchParams.get('markAll') === 'true';

    if (markAll) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          recipientId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({ message: 'All notifications marked as read' });
    } else {
      // Extract notification IDs from request body
      const data = await request.json();
      const { ids } = data;

      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
      }

      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          recipientId: session.user.id,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({ message: 'Notifications marked as read' });
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}

// DELETE - Delete notifications
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract notification IDs from request body
    const data = await request.json();
    const { ids } = data;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
    }

    // Delete the notifications
    await prisma.notification.deleteMany({
      where: {
        id: { in: ids },
        recipientId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}
