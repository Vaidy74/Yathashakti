import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/utils/notifications/notificationTypes';
import Link from 'next/link';
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  MessageSquare,
  AlertCircle,
  User,
} from 'lucide-react';

// Map notification types to their icons
const notificationIcons = {
  TASK_REMINDER: Calendar,
  TASK_ASSIGNED: User,
  TASK_COMPLETED: CheckCircle,
  TASK_COMMENTED: MessageSquare,
  REPAYMENT_DUE: Calendar,
  REPAYMENT_OVERDUE: AlertCircle,
  GRANT_STATUS_UPDATE: Bell,
  PROGRAM_UPDATE: Bell,
  SYSTEM_MESSAGE: Bell,
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  // Get the appropriate icon for this notification type
  const IconComponent = notificationIcons[notification.type] || Bell;

  // Generate the appropriate link based on notification type and related entity
  const getNotificationLink = () => {
    if (notification.taskId) {
      return `/tasks/${notification.taskId}`;
    }
    
    if (notification.relatedEntityType === 'Grant' && notification.relatedEntityId) {
      return `/grants/${notification.relatedEntityId}`;
    }
    
    if (notification.relatedEntityType === 'Program' && notification.relatedEntityId) {
      return `/programs/${notification.relatedEntityId}`;
    }
    
    // Default to notifications page if no specific link
    return '#';
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      className={`p-4 border-b flex items-start ${
        notification.isRead ? 'bg-white' : 'bg-blue-50'
      }`}
    >
      <div className="mr-3 text-blue-500 mt-1">
        <IconComponent size={20} />
      </div>
      
      <div className="flex-1">
        <Link 
          href={getNotificationLink()} 
          onClick={handleClick}
          className="block"
        >
          <h4 className="font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            
            {notification.sender && (
              <span className="ml-2">
                • From: {notification.sender.name}
              </span>
            )}
          </div>
        </Link>
      </div>
      
      <div className="ml-2 flex flex-col space-y-2">
        {!notification.isRead && (
          <button 
            onClick={() => onMarkAsRead(notification.id)}
            className="text-xs text-blue-600 hover:text-blue-800"
            aria-label="Mark as read"
          >
            Mark read
          </button>
        )}
        
        <button 
          onClick={() => onDelete(notification.id)}
          className="text-xs text-red-600 hover:text-red-800"
          aria-label="Delete notification"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
