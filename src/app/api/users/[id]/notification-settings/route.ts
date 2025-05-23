import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { withApiRateLimit } from '@/utils/apiRateLimit';

// Schema for validation
const notificationSettingsSchema = z.object({
  emailTaskReminders: z.boolean(),
  inAppTaskReminders: z.boolean(),
  emailRepaymentReminders: z.boolean(),
  inAppRepaymentReminders: z.boolean(),
  emailGrantUpdates: z.boolean(),
  inAppGrantUpdates: z.boolean(),
  emailProgramUpdates: z.boolean(),
  inAppProgramUpdates: z.boolean(),
  reminderLeadTime: z.number().int().min(1).max(72),
});

// Rate limiter options for sensitive user settings
const rateLimitOptions = {
  points: 10,     // 10 requests
  duration: 60,   // per minute
  blockDuration: 300 // 5 minutes block after too many requests
};

// GET - Fetch user notification settings
export const GET = withApiRateLimit(async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authorization - user can only access their own settings
    // Admins can access any user's settings
    if (!session || 
        (session.user.id !== params.id && 
         session.user.role !== 'SUPER_ADMIN' && 
         session.user.role !== 'PROGRAM_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Find settings for this user
    // Using type assertion since we haven't migrated the schema yet
    const settings = await (prisma as any).notificationSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      return NextResponse.json({ message: 'Notification settings not found' }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}, rateLimitOptions);

// POST - Create new notification settings
export const POST = withApiRateLimit(async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authorization - user can only modify their own settings
    // Admins can modify any user's settings
    if (!session || 
        (session.user.id !== params.id && 
         session.user.role !== 'SUPER_ADMIN' && 
         session.user.role !== 'PROGRAM_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const data = await request.json();

    // Validate request data
    const validation = notificationSettingsSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    // Check if settings already exist for this user
    const existingSettings = await prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (existingSettings) {
      return NextResponse.json(
        { error: 'Settings already exist for this user. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Create new settings
    // Using type assertion since we haven't migrated the schema yet
    const settings = await (prisma as any).notificationSetting.create({
      data: {
        userId,
        ...validation.data,
      },
    });

    return NextResponse.json(settings, { status: 201 });
  } catch (error) {
    console.error('Error creating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to create notification settings' },
      { status: 500 }
    );
  }
}, rateLimitOptions);

// PUT - Update existing notification settings
export const PUT = withApiRateLimit(async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authorization - user can only modify their own settings
    // Admins can modify any user's settings
    if (!session || 
        (session.user.id !== params.id && 
         session.user.role !== 'SUPER_ADMIN' && 
         session.user.role !== 'PROGRAM_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const data = await request.json();

    // Validate request data
    const validation = notificationSettingsSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    // Check if settings exist for this user
    // Using type assertion since we haven't migrated the schema yet
    const existingSettings = await (prisma as any).notificationSetting.findUnique({
      where: { userId },
    });

    if (!existingSettings) {
      return NextResponse.json(
        { error: 'Settings not found for this user. Use POST to create.' },
        { status: 404 }
      );
    }

    // Update settings
    // Using type assertion since we haven't migrated the schema yet
    const settings = await (prisma as any).notificationSetting.update({
      where: { userId },
      data: validation.data,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}, rateLimitOptions);