"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { FiClock, FiUser, FiActivity, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Activity {
  id: string;
  type: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
  showFilters?: boolean;
  onViewAll?: () => void;
}

export default function ActivityFeed({
  activities,
  title = "Recent Activity",
  maxItems = 5,
  showFilters = false,
  onViewAll
}: ActivityFeedProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState(maxItems);
  
  const activityTypes = [...new Set(activities.map(a => a.type))];
  
  const filteredActivities = filter 
    ? activities.filter(activity => activity.type === filter)
    : activities;
    
  const displayedActivities = filteredActivities.slice(0, visibleItems);
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <FiUser className="h-5 w-5" />;
      case 'system':
        return <FiActivity className="h-5 w-5" />;
      default:
        return <FiClock className="h-5 w-5" />;
    }
  };
  
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'system':
        return theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700';
      case 'error':
        return theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      case 'warning':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'success':
        return theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      default:
        return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };
  
  const loadMore = () => {
    setVisibleItems(prev => prev + maxItems);
  };
  
  return (
    <motion.div 
      className={`${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-xl shadow-lg overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className={`p-5 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{title}</h3>
          
          {showFilters && (
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center space-x-1 text-sm px-3 py-1.5 rounded-md ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                <FiFilter className="h-4 w-4" />
                <span>{filter || 'All activities'}</span>
                {isFilterOpen ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 py-1 ${
                      theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <button 
                      onClick={() => {
                        setFilter(null);
                        setIsFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${!filter ? 'font-medium' : ''}`}
                    >
                      All activities
                    </button>
                    
                    {activityTypes.map(type => (
                      <button 
                        key={type}
                        onClick={() => {
                          setFilter(type);
                          setIsFilterOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          theme === 'dark' 
                            ? 'text-gray-300 hover:bg-gray-600' 
                            : 'text-gray-700 hover:bg-gray-100'
                        } ${filter === type ? 'font-medium' : ''}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      <div className={`${theme === 'dark' ? 'bg-gray-800' : ''}`}>
        {displayedActivities.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayedActivities.map((activity) => (
              <motion.li 
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-5 ${
                  theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                } transition-colors`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {activity.user.name}
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {activity.action}
                          {activity.target && <span className="font-medium"> {activity.target}</span>}
                        </p>
                      </div>
                      
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className={`mt-2 text-xs rounded-md p-2 ${
                        theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-start">
                            <span className="font-medium mr-1">{key}:</span>
                            <span>{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className={`p-8 text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>No activities found</p>
          </div>
        )}
        
        {filteredActivities.length > visibleItems && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={loadMore}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              Load more
            </button>
          </div>
        )}
        
        {onViewAll && filteredActivities.length > 0 && (
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } text-center`}>
            <button
              onClick={onViewAll}
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'
              }`}
            >
              View all activity
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}