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
      } border rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor} mr-4`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <p className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{formatter(displayValue)}</p>
          
          {previousValue !== undefined && (
            <div className="flex items-center mt-1">
              {trend !== 'neutral' && (
                <motion.span 
                  className={`text-xs font-medium mr-1 ${
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
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>vs previous period</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}