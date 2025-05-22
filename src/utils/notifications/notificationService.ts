import { prisma } from '@/lib/prisma';
import { 
  CreateNotificationParams, 
  Notification, 
  NotificationContext, 
  NotificationType 
} from './notificationTypes';

/**
 * Service for creating and managing notifications
 */
export const notificationService = {
  /**
   * Create a new notification
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    try {
      return await prisma.notification.create({
        data: {
          type: params.type,
          title: params.title,
          message: params.message,
          recipientId: params.recipientId,
          senderId: params.senderId,
          relatedEntityId: params.relatedEntityId,
          relatedEntityType: params.relatedEntityType,
          taskId: params.taskId,
          expiresAt: params.expiresAt,
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
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Get user notification settings
   */
  async getUserSettings(userId: string) {
    try {
      // Get user settings or create default settings if they don't exist
      let settings = await prisma.notificationSetting.findUnique({
        where: { userId },
      });

      if (!settings) {
        settings = await prisma.notificationSetting.create({
          data: {
            userId,
            emailTaskReminders: true,
            inAppTaskReminders: true,
            emailRepaymentReminders: true,
            inAppRepaymentReminders: true,
            emailGrantUpdates: true,
            inAppGrantUpdates: true,
            emailProgramUpdates: true,
            inAppProgramUpdates: true,
            reminderLeadTime: 24, // Default: 24 hours before due date
          },
        });
      }

      return settings;
    } catch (error) {
      console.error('Error getting user notification settings:', error);
      throw error;
    }
  },

  /**
   * Send a task reminder notification
   */
  async sendTaskReminder(userId: string, context: NotificationContext): Promise<Notification | null> {
    try {
      if (!context.task) {
        throw new Error('Task context is required for task reminder notifications');
      }

      const userSettings = await this.getUserSettings(userId);
      
      // Skip if user has disabled this notification type
      if (!userSettings.inAppTaskReminders) {
        return null;
      }

      const dueDateFormatted = context.task.dueDate
        ? new Date(context.task.dueDate).toLocaleDateString()
        : 'not specified';

      return this.createNotification({
        type: 'TASK_REMINDER',
        title: `Reminder: ${context.task.title} is due soon`,
        message: `Your task "${context.task.title}" is due on ${dueDateFormatted}. Please complete it in time.`,
        recipientId: userId,
        taskId: context.task.id,
        relatedEntityId: context.task.id,
        relatedEntityType: 'Task',
      });
    } catch (error) {
      console.error('Error sending task reminder notification:', error);
      throw error;
    }
  },

  /**
   * Send a task assigned notification
   */
  async sendTaskAssignedNotification(
    userId: string, 
    assignedById: string, 
    context: NotificationContext
  ): Promise<Notification | null> {
    try {
      if (!context.task) {
        throw new Error('Task context is required for task assigned notifications');
      }

      const userSettings = await this.getUserSettings(userId);
      
      // Skip if user has disabled this notification type
      if (!userSettings.inAppTaskReminders) {
        return null;
      }

      const assignedBy = await prisma.user.findUnique({
        where: { id: assignedById },
        select: { name: true },
      });

      return this.createNotification({
        type: 'TASK_ASSIGNED',
        title: `New Task Assigned: ${context.task.title}`,
        message: `${assignedBy?.name || 'Someone'} has assigned you a new task: "${context.task.title}".`,
        recipientId: userId,
        senderId: assignedById,
        taskId: context.task.id,
        relatedEntityId: context.task.id,
        relatedEntityType: 'Task',
      });
    } catch (error) {
      console.error('Error sending task assigned notification:', error);
      throw error;
    }
  },

  /**
   * Send a task completed notification
   */
  async sendTaskCompletedNotification(
    userId: string, 
    completedById: string, 
    context: NotificationContext
  ): Promise<Notification | null> {
    try {
      if (!context.task) {
        throw new Error('Task context is required for task completed notifications');
      }

      const userSettings = await this.getUserSettings(userId);
      
      // Skip if user has disabled this notification type
      if (!userSettings.inAppTaskReminders) {
        return null;
      }

      const completedBy = await prisma.user.findUnique({
        where: { id: completedById },
        select: { name: true },
      });

      return this.createNotification({
        type: 'TASK_COMPLETED',
        title: `Task Completed: ${context.task.title}`,
        message: `${completedBy?.name || 'Someone'} has completed the task: "${context.task.title}".`,
        recipientId: userId,
        senderId: completedById,
        taskId: context.task.id,
        relatedEntityId: context.task.id,
        relatedEntityType: 'Task',
      });
    } catch (error) {
      console.error('Error sending task completed notification:', error);
      throw error;
    }
  },

  /**
   * Check for due tasks and send reminders
   */
  async checkAndSendTaskReminders(): Promise<void> {
    try {
      // Get all users with their notification settings
      const usersWithSettings = await prisma.user.findMany({
        include: {
          notificationSettings: true,
        },
      });

      for (const user of usersWithSettings) {
        // Skip if user has no notification settings or has disabled task reminders
        if (!user.notificationSettings?.inAppTaskReminders) {
          continue;
        }

        const reminderLeadTime = user.notificationSettings?.reminderLeadTime || 24;
        const reminderDate = new Date();
        reminderDate.setHours(reminderDate.getHours() + reminderLeadTime);

        // Find tasks that are due within the reminder lead time
        const dueTasks = await prisma.task.findMany({
          where: {
            assigneeId: user.id,
            status: { not: 'COMPLETED' },
            dueDate: {
              lte: reminderDate,
              gt: new Date(), // Only tasks that aren't overdue yet
            },
          },
        });

        // Send reminder for each due task
        for (const task of dueTasks) {
          // Check if a reminder has already been sent for this task within the last 24 hours
          const existingReminder = await prisma.notification.findFirst({
            where: {
              recipientId: user.id,
              taskId: task.id,
              type: 'TASK_REMINDER',
              createdAt: {
                gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within the last 24 hours
              },
            },
          });

          // If no reminder has been sent recently, send one
          if (!existingReminder) {
            await this.sendTaskReminder(user.id, { task });
          }
        }
      }
    } catch (error) {
      console.error('Error checking and sending task reminders:', error);
      throw error;
    }
  },

  /**
   * Delete expired notifications
   */
  async deleteExpiredNotifications(): Promise<void> {
    try {
      // Delete notifications that have expired
      await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Error deleting expired notifications:', error);
      throw error;
    }
  },
};
