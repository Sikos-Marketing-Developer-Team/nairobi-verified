'use client';

import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode state with system preference on load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    // Toggle the class on <html> element
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Apply the theme from localStorage or system preference on page load
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
    }
  }, []);

  return (
    <button
      className="p-2 rounded-full"
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <span className="text-xl">🌙</span> // Moon icon for dark mode
      ) : (
        <span className="text-xl">🌞</span> // Sun icon for light mode
      )}
    </button>
  );
};
