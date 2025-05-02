'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Detect if the user's system is in dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <ThemeProvider>{children}</ThemeProvider>;
}
 