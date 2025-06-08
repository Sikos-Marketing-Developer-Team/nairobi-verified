"use client";

import { useEffect, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface AnimatedStatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  formatter?: (value: number) => string;
}

export default function AnimatedStatCard({
  title,
  value,
  previousValue,
  icon,
  iconBgColor,
  iconColor,
  formatter = (val) => val.toString()
}: AnimatedStatCardProps) {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  
  // Calculate percent change
  const percentChange = previousValue 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;
  
  // Determine if trend is up, down, or neutral
  const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
  
  useEffect(() => {
    // Animate the counter
    let start = 0;
    const end = value;
    const duration = 1500;
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * end);
      
      setDisplayValue(current);
      
      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <motion.div 
      className={`${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 overflow-hidden relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          
          <div className="mt-2 flex items-baseline">
            <p className={`text-3xl font-extrabold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{formatter(displayValue)}</p>
            
            {previousValue !== undefined && trend !== 'neutral' && (
              <motion.span 
                className={`ml-2 text-sm font-medium ${
                  trend === 'up' 
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600' 
                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {trend === 'up' ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
              </motion.span>
            )}
          </div>
          
          {previousValue !== undefined && (
            <p className={`mt-1 text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              vs previous period
            </p>
          )}
        </div>
        
        <div className={`flex-shrink-0 p-4 rounded-full ${iconBgColor} ${iconColor} shadow-lg`}>
          {icon}
        </div>
      </div>
      
      {/* Progress indicator at bottom */}
      {previousValue !== undefined && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className={trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-blue-500'}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.abs(percentChange) * 2, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}