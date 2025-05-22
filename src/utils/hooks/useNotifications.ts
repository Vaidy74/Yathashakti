import { useState, useCallback, useEffect } from 'react';
import { 
  Notification, 
  NotificationResponse 
} from '@/utils/notifications/notificationTypes';

interface UseNotificationsOptions {
  initialUnreadOnly?: boolean;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    initialUnreadOnly = false,
    limit = 10,
    autoRefresh = true,
    refreshInterval = 60000, // Default refresh interval: 60 seconds
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(initialUnreadOnly);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit,
    totalPages: 0,
  });

  // Fetch notifications from the API
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        unreadOnly: unreadOnly.toString(),
      });

      const response = await fetch(`/api/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: NotificationResponse = await response.json();
      
      setNotifications(data.notifications);
      setPagination(data.pagination);

      // Fetch unread count regardless of current filter
      await fetchUnreadCount();
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, limit]);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        unreadOnly: 'true',
        limit: '1',
      });

      const response = await fetch(`/api/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data: NotificationResponse = await response.json();
      setUnreadCount(data.pagination.total);
      
      return data.pagination.total;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state to mark notifications as read
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      await fetchUnreadCount();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications?markAll=true', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state to mark all notifications as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Update unread count
      setUnreadCount(0);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete notifications
  const deleteNotifications = useCallback(async (notificationIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete notifications');
      }

      // Remove deleted notifications from local state
      setNotifications(prev => 
        prev.filter(notification => !notificationIds.includes(notification.id))
      );

      // Update unread count
      await fetchUnreadCount();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  // Toggle between all notifications and unread only
  const toggleUnreadOnly = useCallback(() => {
    setUnreadOnly(prev => !prev);
  }, []);

  // Change page
  const changePage = useCallback(async (page: number) => {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }
    await fetchNotifications(page);
  }, [fetchNotifications, pagination.totalPages]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchNotifications(pagination.page);
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchNotifications, pagination.page, refreshInterval]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    unreadOnly,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    toggleUnreadOnly,
    changePage,
  };
}
