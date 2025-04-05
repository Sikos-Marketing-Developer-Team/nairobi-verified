'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { FiMenu, FiX } from 'react-icons/fi';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const [userRole, setUserRole] = useState<'admin' | 'vendor' | 'user' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // TODO: Replace with actual auth check
    const checkUserRole = async () => {
      // Simulate role check - replace with actual auth logic
      const role = localStorage.getItem('userRole') || 'user';
      setUserRole(role as 'admin' | 'vendor' | 'user');
    };

    checkUserRole();
  }, []);

  if (!userRole) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="dashboard-layout">
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>

        {children}

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
} 