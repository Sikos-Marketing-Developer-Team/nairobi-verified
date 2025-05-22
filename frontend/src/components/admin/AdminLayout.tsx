"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaChartLine, 
  FaUsers, 
  FaShoppingCart, 
  FaStore, 
  FaTags, 
  FaCreditCard, 
  FaBell, 
  FaCog, 
  FaSignOutAlt,
  FaNewspaper,
  FaImage,
  FaToggleOn
} from "react-icons/fa";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import NotificationBadge from "./NotificationBadge";

interface AdminLayoutProps {
  children: ReactNode;
  notificationCount?: number;
}

export default function AdminLayout({ children, notificationCount = 0 }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/admin/dashboard", 
      icon: <FaChartLine className="w-5 h-5" /> 
    },
    { 
      name: "Analytics", 
      href: "/admin/analytics", 
      icon: <FaChartLine className="w-5 h-5" /> 
    },
    { 
      name: "Users", 
      href: "/admin/users", 
      icon: <FaUsers className="w-5 h-5" /> 
    },
    { 
      name: "Merchants", 
      href: "/admin/merchants", 
      icon: <FaStore className="w-5 h-5" /> 
    },
    { 
      name: "Products", 
      href: "/admin/products", 
      icon: <FaTags className="w-5 h-5" /> 
    },
    { 
      name: "Orders", 
      href: "/admin/orders", 
      icon: <FaShoppingCart className="w-5 h-5" /> 
    },
    { 
      name: "Subscriptions", 
      href: "/admin/subscriptions", 
      icon: <FaCreditCard className="w-5 h-5" /> 
    },
    { 
      name: "Content", 
      href: "/admin/content", 
      icon: <FaNewspaper className="w-5 h-5" /> 
    },
    { 
      name: "Feature Toggles", 
      href: "/admin/features", 
      icon: <FaToggleOn className="w-5 h-5" /> 
    },
    { 
      name: "Notifications", 
      href: "/admin/notifications", 
      icon: <FaBell className="w-5 h-5" /> 
    },
    { 
      name: "Settings", 
      href: "/admin/settings", 
      icon: <FaCog className="w-5 h-5" /> 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/notifications" className="relative">
              <NotificationBadge count={notificationCount} />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside 
          className={`bg-white shadow-md w-64 fixed inset-y-0 left-0 transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition duration-200 ease-in-out z-10 pt-20`}
        >
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-orange-100 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className={`mr-4 ${isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"}`}>
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}