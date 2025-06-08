"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  actions: Array<{
    label: string;
    href: string;
    color?: string;
    icon?: ReactNode;
    onClick?: () => void;
  }>;
}

export default function QuickActionCard({
  title,
  description,
  icon,
  iconBgColor,
  iconColor,
  actions
}: QuickActionCardProps) {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      className={`${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-xl shadow-lg overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-full ${iconBgColor} ${iconColor} mr-3`}>
            {icon}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{title}</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mt-5">
          {actions.map((action, index) => {
            // Use different components based on whether it has onClick or href
            const actionProps = action.onClick 
              ? { 
                  onClick: action.onClick,
                  type: 'button' as 'button'
                } 
              : { href: action.href };
              
            // Create the appropriate component
            const ActionComponent = action.onClick ? motion.button : motion.div;
              
            const bgColor = action.color || (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200');
            const textColor = action.color 
              ? 'text-white' 
              : theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
            
            return action.onClick ? (
              <ActionComponent
                key={index}
                {...actionProps}
                className={`flex items-center justify-between p-3 rounded-lg ${bgColor} ${textColor} transition-colors`}
              >
                <span className="font-medium">{action.label}</span>
                {action.icon || (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </ActionComponent>
            ) : (
              <Link key={index} href={action.href}>
                <ActionComponent
                  className={`flex items-center justify-between p-3 rounded-lg ${bgColor} ${textColor} transition-colors`}
                >
                  <span className="font-medium">{action.label}</span>
                  {action.icon || (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </ActionComponent>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}