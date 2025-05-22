import { prisma } from '@/lib/prisma';
import { notificationService } from './notificationService';
import { addDays, differenceInHours, isPast } from 'date-fns';
import { User, Task } from '@prisma/client';

// Define notification type as string literal since we haven't migrated yet
type NotificationType = 'TASK_REMINDER' | 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'TASK_COMMENTED' | 
  'REPAYMENT_DUE' | 'REPAYMENT_OVERDUE' | 'GRANT_STATUS_UPDATE' | 'PROGRAM_UPDATE' | 'SYSTEM_MESSAGE';

// Define types for user with settings
type UserWithSettings = User & {
  notificationSettings?: {
    inAppTaskReminders: boolean;
    reminderLeadTime: number;
  } | null;
};

// Define task with assignee
type TaskWithAssignee = Task & {
  assignee?: UserWithSettings | null;
};

/**
 * Service for handling task reminders
 */
export const taskReminderService = {
  /**
   * Check for tasks due soon and send reminders to assignees
   * This should be called on a regular schedule (e.g., hourly via a cron job)
   */
  async checkAndSendTaskReminders(): Promise<void> {
    try {
      // Get all users with their notification settings
      // Using type assertion since we haven't migrated the schema yet
      const usersWithSettings = await prisma.user.findMany({
        include: {
          notificationSettings: true as any,
        },
      }) as UserWithSettings[];

      for (const user of usersWithSettings) {
        // Skip if user has no notification settings or has disabled task reminders
        if (!user.notificationSettings || !user.notificationSettings.inAppTaskReminders) {
          continue;
        }

        const reminderLeadTime = user.notificationSettings?.reminderLeadTime || 24;
        
        // Get the date range for tasks that need reminders
        const now = new Date();
        const reminderThreshold = addDays(now, 2); // Look ahead 2 days max

        // Find tasks that are due within the reminder lead time
        const dueTasks = await prisma.task.findMany({
          where: {
            assigneeId: user.id,
            status: { 
              in: ['TO_DO', 'IN_PROGRESS'] // Only send reminders for incomplete tasks
            },
            dueDate: {
              not: null,
              lte: reminderThreshold,
              gt: now, // Only future due dates
            },
          },
        });

        // Process each task and send reminder if needed
        for (const task of dueTasks) {
          if (!task.dueDate) continue;

          // Calculate hours until due
          const hoursUntilDue = differenceInHours(task.dueDate, now);
          
          // Skip if task is due further in the future than the lead time
          if (hoursUntilDue > reminderLeadTime) {
            continue;
          }

          // Check if a reminder has already been sent for this task within the last 24 hours
          // Using type assertion since we haven't migrated the schema yet
          const existingReminder = await (prisma as any).notification.findFirst({
            where: {
              recipientId: user.id,
              taskId: task.id,
              type: 'TASK_REMINDER' as NotificationType,
              createdAt: {
                gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within the last 24 hours
              },
            },
          });

          // If no reminder has been sent recently, send one
          if (!existingReminder) {
            await notificationService.sendTaskReminder(user.id, { 
              task: {
                id: task.id,
                title: task.title,
                dueDate: task.dueDate
              }
            });
            
            console.log(`Sent task reminder for task ${task.id} to user ${user.id}`);
          }
        }
      }
      
      console.log('Task reminder check completed');
    } catch (error) {
      console.error('Error checking and sending task reminders:', error);
      throw error;
    }
  },

  /**
   * Send reminders for overdue tasks
   * This should be called daily
   */
  async sendOverdueTaskReminders(): Promise<void> {
    try {
      // Find all overdue tasks that are not completed or cancelled
      // Using type assertion since we haven't migrated the schema yet
      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            lt: new Date(),
            not: null,
          },
          status: {
            in: ['TO_DO', 'IN_PROGRESS'],
          },
          assigneeId: {
            not: null,
          },
        },
        include: {
          assignee: {
            include: {
              notificationSettings: true as any,
            },
          },
        },
      }) as TaskWithAssignee[];

      for (const task of overdueTasks) {
        if (!task.assignee || !task.assigneeId) continue;
        
        // Skip if user has disabled task reminders
        if (!task.assignee?.notificationSettings || !task.assignee.notificationSettings.inAppTaskReminders) {
          continue;
        }

        // Check if a reminder has already been sent for this task within the last 24 hours
        // Using type assertion since we haven't migrated the schema yet
        const existingReminder = await (prisma as any).notification.findFirst({
          where: {
            recipientId: task.assigneeId as string,
            taskId: task.id,
            type: 'TASK_REMINDER' as NotificationType,
            message: {
              contains: 'overdue',
            },
            createdAt: {
              gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within the last 24 hours
            },
          },
        });

        // If no reminder has been sent recently, send one
        if (!existingReminder) {
          // Using type assertion since we haven't migrated the schema yet
          await (prisma as any).notification.create({
            data: {
              type: 'TASK_REMINDER' as NotificationType,
              title: `Overdue Task: ${task.title}`,
              message: `Your task "${task.title}" is overdue. It was due on ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'an unspecified date'}. Please complete it as soon as possible.`,
              recipientId: task.assigneeId as string,
              taskId: task.id,
              relatedEntityId: task.id,
              relatedEntityType: 'Task',
            },
          });
          
          console.log(`Sent overdue task reminder for task ${task.id} to user ${task.assigneeId}`);
        }
      }
      
      console.log('Overdue task reminder check completed');
    } catch (error) {
      console.error('Error sending overdue task reminders:', error);
      throw error;
    }
  },
};
