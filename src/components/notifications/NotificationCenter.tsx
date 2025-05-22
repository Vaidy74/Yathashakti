import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/utils/hooks/useNotifications';
import NotificationItem from './NotificationItem';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    unreadOnly,
    pagination,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    toggleUnreadOnly,
    changePage,
  } = useNotifications({
    initialUnreadOnly: false,
    limit: 5,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead([id]);
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotifications([id]);
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Icon with Badge */}
      <button
        className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
        onClick={handleToggleDropdown}
        aria-label="Open notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-50 w-80 md:w-96 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-100 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleUnreadOnly}
                className={`text-xs px-2 py-1 rounded ${
                  unreadOnly ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {unreadOnly ? 'Unread Only' : 'All Notifications'}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {unreadOnly ? 'No unread notifications' : 'No notifications'}
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                />
              ))
            )}
          </div>

          {/* Footer with Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-100 border-t flex justify-between items-center">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`text-sm ${
                  pagination.page === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`text-sm ${
                  pagination.page === pagination.totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* View All Link */}
          <div className="px-4 py-3 bg-gray-100 border-t text-center">
            <a
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
