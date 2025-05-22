"use client";

import { useState, ReactNode, useEffect } from "react";
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
  FaToggleOn,
  FaMoon,
  FaSun,
  FaTachometerAlt,
  FaUsersCog,
  FaBoxOpen,
  FaMoneyBillWave,
  FaFileAlt,
  FaClipboardList,
  FaUserShield,
  FaHome
} from "react-icons/fa";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import NotificationBadge from "./NotificationBadge";
import { useTheme } from "@/context/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminLayoutProps {
  children: ReactNode;
  notificationCount?: number;
}

interface NavItem {
  name: string;
  href: string;
  icon: JSX.Element;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AdminLayout({ children, notificationCount = 0 }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminName, setAdminName] = useState("Admin User");
  const [adminRole, setAdminRole] = useState("Super Admin");

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { 
          name: "Dashboard", 
          href: "/admin/dashboard", 
          icon: <FaTachometerAlt className="w-5 h-5" /> 
        },
        { 
          name: "Analytics", 
          href: "/admin/analytics", 
          icon: <FaChartLine className="w-5 h-5" /> 
        },
      ]
    },
    {
      title: "Management",
      items: [
        { 
          name: "Users", 
          href: "/admin/users", 
          icon: <FaUsersCog className="w-5 h-5" />,
          badge: "New",
          badgeColor: "bg-blue-500"
        },
        { 
          name: "Merchants", 
          href: "/admin/merchants", 
          icon: <FaStore className="w-5 h-5" />,
          badge: 3,
          badgeColor: "bg-yellow-500"
        },
        { 
          name: "Products", 
          href: "/admin/products", 
          icon: <FaBoxOpen className="w-5 h-5" /> 
        },
        { 
          name: "Orders", 
          href: "/admin/orders", 
          icon: <FaShoppingCart className="w-5 h-5" /> 
        },
      ]
    },
    {
      title: "Monetization",
      items: [
        { 
          name: "Subscriptions", 
          href: "/admin/subscriptions", 
          icon: <FaCreditCard className="w-5 h-5" /> 
        },
        { 
          name: "Payments", 
          href: "/admin/payments", 
          icon: <FaMoneyBillWave className="w-5 h-5" /> 
        },
      ]
    },
    {
      title: "Content",
      items: [
        { 
          name: "Content Management", 
          href: "/admin/content", 
          icon: <FaNewspaper className="w-5 h-5" /> 
        },
        { 
          name: "Feature Toggles", 
          href: "/admin/features", 
          icon: <FaToggleOn className="w-5 h-5" /> 
        },
      ]
    },
    {
      title: "System",
      items: [
        { 
          name: "Notifications", 
          href: "/admin/notifications", 
          icon: <FaBell className="w-5 h-5" />,
          badge: notificationCount,
          badgeColor: "bg-red-500"
        },
        { 
          name: "Audit Logs", 
          href: "/admin/audit", 
          icon: <FaClipboardList className="w-5 h-5" /> 
        },
        { 
          name: "Settings", 
          href: "/admin/settings", 
          icon: <FaCog className="w-5 h-5" /> 
        },
      ]
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md z-30 fixed top-0 left-0 right-0 transition-colors duration-200`}>
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden mr-4 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/admin/dashboard" className="flex items-center">
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Nairobi <span className="text-orange-500">Admin</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="text-right">
              <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {formatTime(currentTime)}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" target="_blank" className="hidden md:flex">
                    <button
                      className={`px-3 py-1.5 rounded-md flex items-center space-x-1 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } transition-colors`}
                      aria-label="View user site"
                    >
                      <FaHome className="h-4 w-4 mr-1" />
                      <span className="text-sm">View Site</span>
                    </button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View user site in new tab</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                    aria-label="Toggle dark mode"
                  >
                    {theme === 'dark' ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/admin/notifications" className="relative">
                    <NotificationBadge count={notificationCount} onClick={() => router.push("/admin/notifications")} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/admin-avatar.png" alt={adminName} />
                    <AvatarFallback className="bg-orange-500 text-white">
                      {adminName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{adminName}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{adminRole}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                  <FaUserShield className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                  <FaCog className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700">
                  <FaSignOutAlt className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Layout Structure */}
      <div className="flex pt-16">
        {/* Sidebar Navigation */}
        <aside 
          className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md w-64 fixed inset-y-0 left-0 transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition duration-200 ease-in-out z-20 pt-16 flex flex-col`}
        >
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/images/admin-avatar.png" alt={adminName} />
                  <AvatarFallback className="bg-orange-500 text-white">
                    {adminName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{adminName}</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{adminRole}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scrollable navigation area */}
          <div className="flex-grow overflow-y-auto">
            <nav className="mt-4 px-3 pb-24">
              {navSections.map((section, index) => (
                <div key={index} className="mb-6">
                  <h3 className={`px-3 text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  } mb-2`}>
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                            isActive
                              ? theme === 'dark' 
                                ? "bg-orange-900/30 text-orange-400" 
                                : "bg-orange-100 text-orange-600"
                              : theme === 'dark'
                                ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`mr-3 ${
                              isActive 
                                ? theme === 'dark' ? "text-orange-400" : "text-orange-500" 
                                : theme === 'dark' ? "text-gray-400 group-hover:text-gray-300" : "text-gray-400 group-hover:text-gray-500"
                            }`}>
                              {item.icon}
                            </div>
                            {item.name}
                          </div>
                          {item.badge && (
                            <Badge className={`${item.badgeColor || 'bg-gray-500'} text-white text-xs`}>
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          
          {/* Help box at the bottom of the sidebar */}
          <div className={`border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`p-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-3 py-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-orange-50 hover:bg-orange-100'
              } transition-colors duration-200`}>
                <h4 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Need Help?
                </h4>
                <p className={`mt-1 text-xs ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Check our documentation
                </p>
                <button 
                  className={`mt-2 text-xs px-3 py-1.5 rounded-md w-full ${
                    theme === 'dark' 
                      ? 'bg-gray-600 text-white hover:bg-gray-500' 
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  } transition-colors duration-200`}
                  onClick={() => router.push('/admin/support')}
                >
                  View Docs
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="w-full md:pl-64">
          <main className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}