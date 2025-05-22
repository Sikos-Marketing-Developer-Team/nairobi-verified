"use client";

import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  footer
}: ModalProps) {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`relative z-10 w-full ${sizeClasses[size]} mx-auto overflow-hidden rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-xl`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`px-6 py-4 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } ${title ? 'border-b' : ''}`}>
                <div className="flex items-center justify-between">
                  {title && (
                    <h3 className={`text-lg font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {title}
                    </h3>
                  )}
                  
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className={`p-1 rounded-full ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      } focus:outline-none`}
                      aria-label="Close"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Body */}
            <div className="px-6 py-4">
              {children}
            </div>
            
            {/* Footer */}
            {footer && (
              <div className={`px-6 py-4 ${
                theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              } border-t`}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}