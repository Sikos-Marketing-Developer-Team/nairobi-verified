"use client";

import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useSocket } from '@/context/SocketContext';

interface NotificationBadgeProps {
  onClick: () => void;
  count: number;
}

export default function NotificationBadge({ onClick, count }: NotificationBadgeProps) {
  const [animate, setAnimate] = useState(false);
  const { socket, isConnected } = useSocket();

  // Animate badge when new notifications arrive
  useEffect(() => {
    if (count > 0) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [count]);

  return (
    <button 
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none relative"
      onClick={onClick}
    >
      <FaBell className={`text-gray-600 ${animate ? 'animate-pulse' : ''}`} />
      {count > 0 && (
        <span className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full ${animate ? 'animate-bounce' : ''}`}>
          {count}
        </span>
      )}
      {!isConnected && (
        <span className="absolute bottom-0 right-0 h-2 w-2 bg-gray-400 rounded-full"></span>
      )}
      {isConnected && (
        <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
      )}
    </button>
  );
}