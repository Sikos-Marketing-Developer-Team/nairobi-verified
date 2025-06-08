"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

interface DashboardSummaryCardProps {
  title: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  description: string;
  stats: Array<{
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
  }>;
  actionLabel?: string;
  actionLink?: string;
  gradient?: boolean;
}

export default function DashboardSummaryCard({
  title,
  icon,
  iconBgColor,
  iconColor,
  description,
  stats,
  actionLabel,
  actionLink,
  gradient = false
}: DashboardSummaryCardProps) {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      className={`${
        theme === 'dark' 
          ? gradient 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
            : 'bg-gray-800 border-gray-700' 
          : gradient 
            ? 'bg-gradient-to-br from-white to-gray-50 border-gray-200' 
            : 'bg-white border-gray-200'
      } border rounded-xl shadow-lg overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg ${iconBgColor} ${iconColor} mr-3`}>
            {icon}
          </div>
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{title}</h3>
        </div>
        
        <p className={`text-sm mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>{description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <p className={`text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>{stat.label}</p>
              <p className={`text-xl font-bold mt-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{stat.value}</p>
              
              {stat.change !== undefined && (
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium ${
                    stat.change > 0 
                      ? 'text-green-500' 
                      : stat.change < 0 
                        ? 'text-red-500' 
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {stat.change > 0 ? '↑' : stat.change < 0 ? '↓' : '•'} 
                    {stat.change !== 0 ? `${Math.abs(stat.change)}%` : 'No change'}
                  </span>
                  {stat.changeLabel && (
                    <span className={`text-xs ml-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {stat.changeLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {actionLabel && actionLink && (
          <div className="mt-2">
            <Link href={actionLink}>
              <motion.div
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  theme === 'dark' 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } transition-colors`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {actionLabel}
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.div>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}