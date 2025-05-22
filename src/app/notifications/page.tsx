'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/utils/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import { Bell, CheckCircle, Trash } from 'lucide-react';

const NotificationsPage = () => {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
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
    limit: 10,
    autoRefresh: false,
  });

  const handleMarkAsRead = async (id: string) => {
    await markAsRead([id]);
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotifications([id]);
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notificationId => notificationId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleMarkSelectedAsRead = async () => {
    const unreadSelected = selectedNotifications.filter(
      id => !notifications.find(n => n.id === id)?.isRead
    );
    
    if (unreadSelected.length > 0) {
      await markAsRead(unreadSelected);
    }
    
    setSelectedNotifications([]);
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length > 0) {
      await deleteNotifications(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Bell size={24} className="mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={toggleUnreadOnly}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              unreadOnly
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {unreadOnly ? 'Showing Unread' : 'All Notifications'}
          </button>
        </div>
      </div>

      {/* Action bar */}
      {notifications.length > 0 && (
        <div className="bg-white border rounded-md p-3 mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="select-all"
              className="mr-2"
              checked={selectedNotifications.length === notifications.length && notifications.length > 0}
              onChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm text-gray-600">
              Select All
            </label>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleMarkSelectedAsRead}
              disabled={selectedNotifications.length === 0}
              className="flex items-center px-3 py-1.5 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={16} className="mr-1" /> Mark as Read
            </button>
            
            <button
              onClick={handleDeleteSelected}
              disabled={selectedNotifications.length === 0}
              className="flex items-center px-3 py-1.5 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash size={16} className="mr-1" /> Delete
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white border rounded-md overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-1">No notifications</p>
            <p className="text-sm">
              {unreadOnly ? 'You have no unread notifications.' : 'You have no notifications.'}
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start">
                <div className="pl-3 py-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            <button
              onClick={() => changePage(1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 rounded border bg-blue-50 text-sm text-blue-700">
              {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 rounded border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            
            <button
              onClick={() => changePage(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 rounded border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
