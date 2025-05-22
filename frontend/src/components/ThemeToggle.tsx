'use client';

import { useTheme } from '@/context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`p-2 rounded-full ${
        theme === 'dark' 
          ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } transition-colors`}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <FaSun className="h-5 w-5" />
      ) : (
        <FaMoon className="h-5 w-5" />
      )}
    </button>
  );
};
