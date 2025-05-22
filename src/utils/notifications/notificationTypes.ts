// Type definitions for the notification system

export type NotificationType = 
  | 'TASK_REMINDER'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'TASK_COMMENTED'
  | 'REPAYMENT_DUE'
  | 'REPAYMENT_OVERDUE'
  | 'GRANT_STATUS_UPDATE'
  | 'PROGRAM_UPDATE'
  | 'SYSTEM_MESSAGE';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  recipientId: string;
  senderId?: string | null;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
  taskId?: string | null;
  createdAt: Date;
  expiresAt?: Date | null;
  recipient?: {
    id: string;
    name: string;
  };
  sender?: {
    id: string;
    name: string;
  } | null;
  task?: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: Date | null;
  } | null;
}

export interface NotificationSetting {
  id: string;
  userId: string;
  emailTaskReminders: boolean;
  inAppTaskReminders: boolean;
  emailRepaymentReminders: boolean;
  inAppRepaymentReminders: boolean;
  emailGrantUpdates: boolean;
  inAppGrantUpdates: boolean;
  emailProgramUpdates: boolean;
  inAppProgramUpdates: boolean;
  reminderLeadTime: number; // Hours before due date to send reminder
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  taskId?: string;
  expiresAt?: Date | null;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificationContext {
  task?: {
    id: string;
    title: string;
    dueDate?: Date | null;
    assigneeId?: string | null;
  };
  repayment?: {
    id: string;
    amount: number;
    dueDate: Date;
    grantId: string;
    grantTitle?: string;
  };
  grant?: {
    id: string;
    title: string;
    status: string;
  };
  program?: {
    id: string;
    name: string;
  };
  system?: {
    message: string;
  };
}
