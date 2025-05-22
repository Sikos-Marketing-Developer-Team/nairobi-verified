"use client";

import { useState } from 'react';
import { FaTrash, FaCheck } from 'react-icons/fa';

interface Notification {
  id: string;
  message: string;
  time: Date;
  read?: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  onClearAll: () => void;
  onMarkAllRead: () => void;
}

export default function NotificationList({ 
  notifications, 
  onClearAll, 
  onMarkAllRead 
}: NotificationListProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleString();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        <div className="flex space-x-2">
          <button 
            onClick={onMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaCheck className="mr-1" /> Mark all read
          </button>
          <button 
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <FaTrash className="mr-1" /> Clear all
          </button>
        </div>
      </div>
      
      <div className="px-4 py-2 border-b border-gray-200 flex">
        <button
          onClick={() => setFilter('all')}
          className={`mr-4 px-2 py-1 text-sm rounded ${
            filter === 'all' 
              ? 'bg-blue-100 text-blue-800' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-2 py-1 text-sm rounded ${
            filter === 'unread' 
              ? 'bg-blue-100 text-blue-800' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Unread
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${notification.read ? 'opacity-75' : ''}`}
              >
                <div className="flex justify-between">
                  <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTime(notification.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}