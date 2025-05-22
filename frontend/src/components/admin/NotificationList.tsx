"use client";

import { useState } from 'react';
import { FaTrash, FaCheck } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme } = useTheme();
  
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
    <div className={`${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-lg overflow-hidden max-w-md w-full transition-colors duration-200`}>
      <div className={`px-4 py-3 ${
        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
      } border-b flex justify-between items-center`}>
        <h3 className={`text-lg font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Notifications</h3>
        <div className="flex space-x-2">
          <button 
            onClick={onMarkAllRead}
            className={`text-sm ${
              theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
            } flex items-center`}
          >
            <FaCheck className="mr-1" /> Mark all read
          </button>
          <button 
            onClick={onClearAll}
            className={`text-sm ${
              theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
            } flex items-center`}
          >
            <FaTrash className="mr-1" /> Clear all
          </button>
        </div>
      </div>
      
      <div className={`px-4 py-2 ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      } border-b flex`}>
        <button
          onClick={() => setFilter('all')}
          className={`mr-4 px-2 py-1 text-sm rounded ${
            filter === 'all' 
              ? theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
              : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-2 py-1 text-sm rounded ${
            filter === 'unread' 
              ? theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
              : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Unread
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className={`p-4 text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No notifications
          </div>
        ) : (
          <div className={`divide-y ${
            theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                } ${notification.read ? 'opacity-75' : ''}`}
              >
                <div className="flex justify-between">
                  <p className={`text-sm ${
                    notification.read 
                      ? theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      : theme === 'dark' ? 'text-gray-100 font-medium' : 'text-gray-900 font-medium'
                  }`}>
                    {notification.message}
                  </p>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  } whitespace-nowrap ml-2`}>
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