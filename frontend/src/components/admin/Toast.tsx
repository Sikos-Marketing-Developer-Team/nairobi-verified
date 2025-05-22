"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { ToastMessage } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(100);
  const { id, type, title, message, duration = 5000 } = toast;
  
  // Handle progress bar animation
  useEffect(() => {
    if (duration === Infinity) return;
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;
      
      if (newProgress <= 0) {
        onClose();
      } else {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      }
    };
    
    const animationId = requestAnimationFrame(updateProgress);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [duration, onClose]);
  
  // Get icon and colors based on toast type
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="w-5 h-5" />,
          bgColor: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50',
          textColor: theme === 'dark' ? 'text-green-300' : 'text-green-800',
          borderColor: theme === 'dark' ? 'border-green-800' : 'border-green-200',
          progressColor: theme === 'dark' ? 'bg-green-500' : 'bg-green-500',
        };
      case 'error':
        return {
          icon: <FaExclamationCircle className="w-5 h-5" />,
          bgColor: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
          textColor: theme === 'dark' ? 'text-red-300' : 'text-red-800',
          borderColor: theme === 'dark' ? 'border-red-800' : 'border-red-200',
          progressColor: theme === 'dark' ? 'bg-red-500' : 'bg-red-500',
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="w-5 h-5" />,
          bgColor: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50',
          textColor: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800',
          borderColor: theme === 'dark' ? 'border-yellow-800' : 'border-yellow-200',
          progressColor: theme === 'dark' ? 'bg-yellow-500' : 'bg-yellow-500',
        };
      case 'info':
      default:
        return {
          icon: <FaInfoCircle className="w-5 h-5" />,
          bgColor: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50',
          textColor: theme === 'dark' ? 'text-blue-300' : 'text-blue-800',
          borderColor: theme === 'dark' ? 'border-blue-800' : 'border-blue-200',
          progressColor: theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500',
        };
    }
  };
  
  const { icon, bgColor, textColor, borderColor, progressColor } = getToastStyles();
  
  return (
    <AnimatePresence>
      <motion.div
        key={id}
        className={`max-w-md w-full pointer-events-auto overflow-hidden rounded-lg shadow-lg border ${bgColor} ${borderColor}`}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${textColor}`}>
              {icon}
            </div>
            <div className="ml-3 w-0 flex-1">
              {title && (
                <p className={`text-sm font-medium ${textColor}`}>
                  {title}
                </p>
              )}
              <p className={`mt-1 text-sm ${textColor}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex rounded-md ${textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-500'
                }`}
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        {duration !== Infinity && (
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full ${progressColor} transition-all duration-300 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}