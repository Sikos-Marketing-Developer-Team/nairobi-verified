"use client";

import { useTheme } from '@/context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-2xl">
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Appearance</h2>
          </div>
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-gray-500">
                  Choose between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                {theme === 'dark' ? (
                  <>
                    <FiMoon size={20} />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <FiSun size={20} />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-card mt-6">
          <div className="card-header">
            <h2 className="card-title">Profile Settings</h2>
          </div>
          <div className="card-content">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 