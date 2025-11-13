import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  Heart, 
  ShoppingCart, 
  Phone, 
  User, 
  LogIn,
  Zap,
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Store,
  Shield,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Grid
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isMobileCategoriesModalOpen, setIsMobileCategoriesModalOpen] = useState(false);
  const navbarRef = useRef(null);
  const searchInputRef = useRef(null);
  const marketDropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);
  const mobileCategoriesModalRef = useRef(null);
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth state from context
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // FIXED: User role handling - merchants always use merchant interface
  const isAdmin = user?.role === 'admin';
  const isMerchant = user?.role === 'merchant';
  const isRegularUser = isAuthenticated && !isMerchant && !isAdmin;
  
  // FIXED: Show merchant navbar for merchants/admins
  const showMerchantNav = isMerchant || isAdmin;

  // FIXED: Enhanced session restoration for merchants - more reliable
  useEffect(() => {
    if (isLoading) return; // Wait for auth to load
    
    // Only redirect if authenticated, is merchant/admin, and not already on a merchant route
    if (isAuthenticated && showMerchantNav) {
      const currentPath = location.pathname;
      const isOnMerchantRoute = currentPath.startsWith('/merchant');
      const isOnAuthRoute = currentPath.startsWith('/auth');
      const isOnUserDashboard = currentPath === '/dashboard';
      const isOnRoot = currentPath === '/';
      
      // If merchant is on user dashboard, root, or non-merchant route, redirect immediately
      if (isOnUserDashboard || isOnRoot || (!isOnMerchantRoute && !isOnAuthRoute)) {
        console.log('🔄 Session restoration: Redirecting merchant to dashboard from', currentPath);
        navigate('/merchant/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, showMerchantNav, location.pathname, navigate, isLoading]);

  // FIXED: Additional protection - prevent navigation to user routes for merchants
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    if (showMerchantNav) {
      const currentPath = location.pathname;
      const restrictedUserRoutes = [
        '/dashboard',
        '/profile',
        '/favorites', 
        '/cart',
        '/products',
        '/merchants',
        '/categories'
      ];

      // Check if current path is a user route that merchants shouldn't access
      const isRestrictedRoute = restrictedUserRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (isRestrictedRoute) {
        console.log('🚫 Merchant attempted to access user route, redirecting:', currentPath);
        navigate('/merchant/dashboard', { replace: true });
      }
    }
  }, [location.pathname, isAuthenticated, showMerchantNav, navigate, isLoading]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (marketDropdownRef.current && !marketDropdownRef.current.contains(event.target)) {
        setIsMarketDropdownOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target)) {
        setIsCategoriesDropdownOpen(false);
      }
      if (mobileCategoriesModalRef.current && !mobileCategoriesModalRef.current.contains(event.target)) {
        setIsMobileCategoriesModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (document.activeElement?.tagName !== 'INPUT' && e.key === '/')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
      
      if (e.key === 'Escape' && isMarketDropdownOpen) {
        setIsMarketDropdownOpen(false);
      }
      
      if (e.key === 'Escape' && isCategoriesDropdownOpen) {
        setIsCategoriesDropdownOpen(false);
      }
      
      if (e.key === 'Escape' && isMobileCategoriesModalOpen) {
        setIsMobileCategoriesModalOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, isMarketDropdownOpen, isCategoriesDropdownOpen, isMobileCategoriesModalOpen]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search logic here
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  // FIXED: Better user display name
  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
    }
    return user?.businessName || user?.email?.split('@')[0] || 'User';
  };

  // FIXED: Better dashboard URL logic - merchants always go to merchant dashboard
  const getDashboardUrl = () => {
    if (!isAuthenticated || !user) {
      return '/auth';
    }
    
    // Merchant users ALWAYS go to merchant dashboard
    if (showMerchantNav) {
      return '/merchant/dashboard';
    }
    
    // Regular users go to user dashboard
    return '/dashboard';
  };

  // Function to handle dashboard navigation
  const handleDashboardNavigation = () => {
    const dashboardUrl = getDashboardUrl();
    navigate(dashboardUrl);
    setIsMenuOpen(false);
  };

  // FIXED: Handle navigation for merchants to user routes in new tab
  const handleMerchantToUserRoute = (path, e) => {
    // Allow merchant routes to work normally
    if (path.startsWith('/merchant')) {
      return false;
    }
    
    // For non-merchant routes, open in new tab for merchants
    if (showMerchantNav) {
      e.preventDefault();
      const fullUrl = window.location.origin + path;
      window.open(fullUrl, '_blank');
      return true;
    }
    return false;
  };

  // UPDATED: Merchant-specific navigation items - ONLY routes that actually exist
  const merchantNavItems = [
    { path: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/merchant/profile/edit', label: 'Profile', icon: User },
  ];

  // FIXED: User navigation items with improved categories structure
  const userNavItems = [
    { path: '/products', label: 'Hot Deals', icon: Zap, highlight: true },
    { 
      path: '/categories', 
      label: 'Categories', 
      icon: Grid, 
      hasDropdown: true,
      dropdownItems: [
        { path: '/categories', label: 'View All Categories' },
        // Group categories into logical sections
        {
          section: 'Popular Categories',
          items: [
            { path: '/products?category=electronics', label: 'Electronics' },
            { path: '/products?category=fashion', label: 'Fashion & Apparel' },
            { path: '/products?category=beauty', label: 'Health & Beauty' },
            { path: '/products?category=food', label: 'Food & Beverages' },
            { path: '/products?category=home', label: 'Home & Garden' },
          ]
        },
        {
          section: 'Lifestyle & Services',
          items: [
            { path: '/products?category=transport', label: 'Transport & Mobility' },
            { path: '/products?category=events', label: 'Events & Decorations' },
            { path: '/products?category=medical', label: 'Medical & Wellness' },
            { path: '/products?category=personalcare', label: 'Beauty & Personal Care' },
            { path: '/products?category=tailoring', label: 'Fashion & Tailoring' },
          ]
        },
        {
          section: 'Business & Education',
          items: [
            { path: '/products?category=printing', label: 'Printing & Stationery' },
            { path: '/products?category=business', label: 'Business Services' },
            { path: '/products?category=books', label: 'Books & Media' },
            { path: '/products?category=automotive', label: 'Automotive' },
            { path: '/products?category=sports', label: 'Sports & Fitness' },
            { path: '/products?category=household', label: 'Household & Kitchen' },
          ]
        }
      ]
    },
    { path: '/merchants', label: 'Shops', icon: Store },
    { path: '/about', label: 'About' },
    { path: '/all-products', label: 'All Products' },
  ];

  // Market research links for merchants
  const marketResearchLinks = [
    { path: '/products', label: 'Browse Products', icon: Store, description: 'See trending products' },
    { path: '/merchants', label: 'View Competitors', icon: BarChart3, description: 'Analyze other shops' },
    { path: '/categories', label: 'Explore Categories', icon: TrendingUp, description: 'Popular categories' },
  ];

  // FIXED: Get current navigation items based on context
  const getNavItems = () => {
    return showMerchantNav ? merchantNavItems : userNavItems;
  };

  // Handle opening market research links
  const handleMarketResearchClick = (path) => {
    const fullUrl = window.location.origin + path;
    window.open(fullUrl, '_blank');
    setIsMarketDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // FIXED: Handle contact navigation - use existing /contact route for both
  const handleContactClick = (e) => {
    if (showMerchantNav) {
      e.preventDefault();
      const fullUrl = window.location.origin + '/contact';
      window.open(fullUrl, '_blank');
    }
  };

  // Handle mobile categories modal navigation
  const handleMobileCategoryClick = (path) => {
    navigate(path);
    setIsMobileCategoriesModalOpen(false);
    setIsMenuOpen(false);
  };

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <nav className="fixed w-full top-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-22 h-12 bg-gray-200 rounded-[16px] animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Render Categories Mega Menu for Desktop
  const renderCategoriesMegaMenu = () => (
    <li className="relative" ref={categoriesDropdownRef}>
      <button 
        onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
        className="hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 text-gray-900"
        title="Browse All Categories"
      >
        Categories
        <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isCategoriesDropdownOpen && (
        <div className="absolute left-0 mt-2 w-[600px] rounded-[16px] bg-white text-gray-800 shadow-xl z-50 border border-gray-100 text-base p-6">
          {/* Header */}
          <div className="mb-4">
            <Link 
              to="/categories"
              className="text-lg font-bold text-orange-600 hover:text-orange-700 transition-colors"
              onClick={() => setIsCategoriesDropdownOpen(false)}
            >
              View All Categories →
            </Link>
          </div>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Popular Categories Column */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">
                Popular
              </h3>
              <ul className="space-y-2">
                {userNavItems.find(item => item.hasDropdown)?.dropdownItems
                  .find(section => section.section === 'Popular Categories')?.items
                  .map((item) => (
                    <li key={item.label}>
                      <Link 
                        to={item.path}
                        className="block py-1.5 px-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors text-sm"
                        onClick={() => setIsCategoriesDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            
            {/* Lifestyle & Services Column */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">
                Lifestyle & Services
              </h3>
              <ul className="space-y-2">
                {userNavItems.find(item => item.hasDropdown)?.dropdownItems
                  .find(section => section.section === 'Lifestyle & Services')?.items
                  .map((item) => (
                    <li key={item.label}>
                      <Link 
                        to={item.path}
                        className="block py-1.5 px-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors text-sm"
                        onClick={() => setIsCategoriesDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            
            {/* Business & Education Column */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">
                Business & Education
              </h3>
              <ul className="space-y-2">
                {userNavItems.find(item => item.hasDropdown)?.dropdownItems
                  .find(section => section.section === 'Business & Education')?.items
                  .map((item) => (
                    <li key={item.label}>
                      <Link 
                        to={item.path}
                        className="block py-1.5 px-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors text-sm"
                        onClick={() => setIsCategoriesDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          
          {/* Quick Search Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Search className="w-4 h-4" />
              <span>Can't find what you're looking for?</span>
              <Link 
                to="/all-products" 
                className="text-orange-600 hover:text-orange-700 font-medium"
                onClick={() => setIsCategoriesDropdownOpen(false)}
              >
                Browse all products
              </Link>
            </div>
          </div>
        </div>
      )}
    </li>
  );

  // Render Mobile Categories Modal
  const renderMobileCategoriesModal = () => {
    if (!isMobileCategoriesModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 md:hidden">
        <div 
          ref={mobileCategoriesModalRef}
          className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl"
        >
          {/* Modal Header */}
          <div className="bg-orange-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Grid className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-bold">All Categories</h2>
                  <p className="text-orange-100 text-sm">Browse our product categories</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileCategoriesModalOpen(false)}
                className="p-1 hover:bg-orange-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {/* View All Categories Button */}
            <button
              onClick={() => handleMobileCategoryClick('/categories')}
              className="w-full bg-orange-50 text-orange-700 font-semibold py-3 px-4 rounded-xl mb-4 flex items-center justify-between hover:bg-orange-100 transition-colors"
            >
              <span>View All Categories</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Categories Sections */}
            {userNavItems.find(item => item.hasDropdown)?.dropdownItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                {section.section && (
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">
                    {section.section}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items?.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleMobileCategoryClick(item.path)}
                      className="w-full text-left py-3 px-3 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors flex items-center justify-between text-gray-800"
                    >
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Actions Footer */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <button
                onClick={() => handleMobileCategoryClick('/all-products')}
                className="w-full text-center text-orange-600 font-semibold py-2 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Browse All Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render desktop navigation items
  const renderDesktopNavItems = () => {
    const items = getNavItems();
    
    return items.map((item) => {
      // Skip rendering categories dropdown here since we have a separate mega menu
      if (item.hasDropdown && !showMerchantNav) {
        return null; // We'll render the mega menu separately
      }

      const IconComponent = item.icon;

      return (
        <li key={item.path}>
          <Link 
            to={item.path}
            className={`hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 text-gray-900 ${
              item.highlight ? 'text-orange-600' : ''
            }`}
            title={item.label}
            onClick={(e) => handleMerchantToUserRoute(item.path, e)}
          >
            {IconComponent && <IconComponent className={`w-4 h-4 ${item.highlight ? 'text-orange-600' : 'text-gray-900'}`} />}
            {item.label}
          </Link>
        </li>
      );
    }).filter(Boolean); // Remove null values
  };

  // Render mobile navigation items
  const renderMobileNavItems = () => {
    const items = getNavItems();
    
    return items.map((item) => {
      if (item.hasDropdown && !showMerchantNav) {
        return (
          <button
            key={item.label}
            onClick={() => setIsMobileCategoriesModalOpen(true)}
            className="w-full text-left hover:text-orange-600 transition-colors text-gray-800 font-semibold flex items-center justify-between py-2"
          >
            <span className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              {item.label}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        );
      }

      const IconComponent = item.icon;

      return (
        <Link
          key={item.path}
          to={item.path}
          onClick={(e) => {
            if (handleMerchantToUserRoute(item.path, e)) {
              setIsMenuOpen(false);
            }
          }}
          className={`block hover:text-orange-600 transition-colors text-gray-800 ${
            item.highlight ? 'text-orange-600' : ''
          }`}
          title={item.label}
        >
          {item.label}
        </Link>
      );
    });
  };

  // Render market research dropdown for desktop
  const renderMarketResearchDropdown = () => (
    <li className="relative" ref={marketDropdownRef}>
      <button 
        onClick={() => setIsMarketDropdownOpen(!isMarketDropdownOpen)}
        className="hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 text-gray-900"
        title="Market Research"
      >
        <TrendingUp className="w-4 h-4" />
        Market Research
        <ChevronDown className={`w-4 h-4 transition-transform ${isMarketDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isMarketDropdownOpen && (
        <ul className="absolute left-0 mt-2 w-64 rounded-[16px] bg-white text-gray-800 shadow-xl z-50 border border-gray-100 text-base">
          {marketResearchLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <li key={link.path}>
                <button
                  onClick={() => handleMarketResearchClick(link.path)}
                  className="block w-full text-left px-4 py-3 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 last:border-b-0"
                  title={link.label}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{link.label}</div>
                      <div className="text-xs text-gray-500">{link.description}</div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );

  // Render market research section for mobile
  const renderMobileMarketResearch = () => (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <span className="font-bold block mb-2 text-gray-900 text-base">Market Research</span>
      <div className="space-y-1">
        {marketResearchLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => handleMarketResearchClick(link.path)}
              className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-colors flex items-center gap-2"
              title={link.label}
            >
              <IconComponent className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">{link.label}</div>
                <div className="text-xs text-gray-500">{link.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <nav 
        ref={navbarRef}
        className={`fixed w-full top-0 z-40 transition-all duration-300 text-[15px] bg-white ${
          scrolled ? 'shadow-lg bg-opacity-95 backdrop-blur-sm' : 'shadow-md'
        } ${showMerchantNav ? 'merchant-nav border-b border-gray-200' : 'user-nav'}`}
        aria-label="Main navigation"
      >
        {/* Single Row - Logo, Icons, and Hamburger Menu */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo */}
          <Link 
            to={showMerchantNav ? "/merchant/dashboard" : "/"} 
            className="flex items-center space-x-3 group"
            title={showMerchantNav ? "Merchant Dashboard - Home" : "Nairobi Verified - Home"}
          >
            <img
              src="/Nairobi Verified Logo.png"
              alt="Nairobi Verified Logo"
              className="w-22 h-12 object-contain rounded-[16px] shadow-sm transition-transform group-hover:scale-105"
            />
            {showMerchantNav && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold border border-gray-300">
                Merchant 
              </span>
            )}
          </Link>

          {/* Show placeholder when in merchant mode */}
          {showMerchantNav && (
            <div className="hidden md:flex items-center justify-center flex-1 mx-8">
              <span className="text-gray-700 font-semibold text-lg">Business Portal</span>
            </div>
          )}
      
          {/* User Options & Hamburger Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Dropdown - Hidden on mobile */}
                <div className="hidden sm:flex relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors p-2 rounded-[14px] hover:bg-orange-50">
                    <div className={`p-1 rounded-full ${showMerchantNav ? 'bg-gray-100' : 'bg-orange-50'} text-gray-700`}>
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-gray-800">Hello, {getUserDisplayName()}</span>
                    <ChevronDown className="w-5 h-5 text-orange-600" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 rounded-[16px] bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
                    <button 
                      onClick={handleDashboardNavigation}
                      className="block w-full text-left px-4 py-3 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 text-gray-800"
                      title="My Dashboard"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        {showMerchantNav ? 'Merchant Dashboard' : 'My Dashboard'}
                      </div>
                    </button>
                    
                    {/* Show different profile links based on user type */}
                    {showMerchantNav ? (
                      <Link 
                        to="/merchant/profile/edit"
                        className="block px-4 py-3 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 text-gray-800"
                        title="Merchant Profile"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Merchant Profile
                        </div>
                      </Link>
                    ) : (
                      <Link 
                        to="/profile"
                        className="block px-4 py-3 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 text-gray-800"
                        title="My Profile"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          My Profile
                        </div>
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 hover:text-orange-600 transition-colors text-gray-800"
                      title="Logout"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="hidden sm:flex items-center gap-1 bg-orange-600 hover:bg-orange-700 transition-colors text-white font-semibold px-3 py-1.5 rounded-[16px]"
                title="Sign In to Nairobi Verified"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
            
            {/* Conditionally render wishlist only when authenticated AND not merchant view */}
            {isAuthenticated && !showMerchantNav && isRegularUser && (
              <Link 
                to="/favorites" 
                className="hidden sm:flex hover:scale-110 transition-transform duration-200 text-gray-700 text-xl bg-orange-50 p-2 rounded-[16px] relative"
                title="My Favorite Shops"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-600 text-xs text-white font-bold rounded-[16px] w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              </Link>
            )}
            
            {/* Shopping Cart - Only show for regular users */}
            {!showMerchantNav && isRegularUser && (
              <Link 
                to="/cart" 
                className="hidden sm:flex hover:scale-110 transition-transform duration-200 text-gray-700 text-xl bg-orange-50 p-2 rounded-[16px] relative"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-600 text-xs text-white font-bold rounded-[16px] w-5 h-5 flex items-center justify-center">0</span>
              </Link>
            )}

            {/* Hamburger Menu - Only visible on mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden text-gray-800 focus:outline-none text-xl p-2 rounded-[16px] ${
                showMerchantNav ? 'bg-gray-100 text-gray-700' : 'bg-orange-50'
              }`}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              title={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links - Hidden on mobile */}
        <div className={`hidden md:flex items-center justify-between px-6 py-2 border-t text-base ${
          showMerchantNav ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-200 text-gray-800 bg-white'
        }`}>
          <ul className="flex space-x-6 p-2">
            {renderDesktopNavItems()}
            {/* Add Categories Mega Menu for users */}
            {!showMerchantNav && renderCategoriesMegaMenu()}
            {/* Add Market Research dropdown for merchants */}
            {showMerchantNav && renderMarketResearchDropdown()}
          </ul>

          <ul className="flex items-center space-x-6">
            <li>
              <Link 
                to="/contact"
                className={`hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 text-gray-900 ${
                  showMerchantNav ? 'text-gray-700 hover:text-orange-600' : 'text-orange-600'
                }`}
                title={showMerchantNav ? "Contact Support" : "Contact Us"}
                onClick={handleContactClick}
              >
                <Phone className={`w-4 h-4 ${showMerchantNav ? 'text-gray-600' : 'text-orange-600'}`} /> 
                {showMerchantNav ? 'Contact Support' : 'Contact Us'}
              </Link>
            </li>
                        
            {/* Social Media Links - Only show for users */}
            {!showMerchantNav && (
              <li className="flex space-x-2">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:scale-110 transition-transform duration-200 text-gray-700 bg-orange-50 p-1.5 rounded-[16px]"
                  title="Follow us on Facebook"
                >
                  <Facebook className="w-4 h-4 text-orange-600" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:scale-110 transition-transform duration-200 text-gray-700 bg-orange-50 p-1.5 rounded-[16px]"
                  title="Follow us on Twitter"
                >
                  <Twitter className="w-4 h-4 text-orange-600" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:scale-110 transition-transform duration-200 text-gray-700 bg-orange-50 p-1.5 rounded-[16px]"
                  title="Follow us on Instagram"
                >
                  <Instagram className="w-4 h-4 text-orange-600" />
                </a>
              </li>
            )}
            
            {/* Show "Become a Seller" for regular users */}
            {!showMerchantNav && isRegularUser && (
              <li>
                <Link 
                  to="/auth/register/merchant"
                  className="bg-orange-600 hover:bg-orange-700 transition-colors text-white font-semibold px-3 py-1.5 rounded-[16px] text-sm"
                  title="Become a Seller"
                >
                  Sell on Nairobi Verified
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`px-4 py-3 bg-white md:hidden space-y-3 text-gray-800 font-medium shadow-lg transition-all duration-300 ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
          aria-hidden={!isMenuOpen}
        >
          {/* User Info for Mobile */}
          {isAuthenticated && (
            <div className="border-b border-gray-200 pb-2 mb-1">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                <span className="font-semibold text-sm">Hello, {getUserDisplayName()}</span>
              </div>
            </div>
          )}

          {renderMobileNavItems()}
          
          {/* Market Research Section for Mobile - Only for merchants */}
          {showMerchantNav && renderMobileMarketResearch()}
          
          {/* Contact Us */}
          <button
            onClick={() => {
              if (showMerchantNav) {
                const fullUrl = window.location.origin + '/contact';
                window.open(fullUrl, '_blank');
              } else {
                navigate('/contact');
              }
              setIsMenuOpen(false);
            }}
            className="w-full text-left hover:text-orange-600 transition-colors py-1 flex items-center gap-1 text-orange-600 text-sm"
            title={showMerchantNav ? "Contact Support" : "Contact Us"}
          >
            <Phone className="w-4 h-4 text-orange-600" /> 
            {showMerchantNav ? 'Contact Support' : 'Contact Us'}
          </button>
          
          {/* Dashboard Link for Authenticated Users in Mobile Menu */}
          {isAuthenticated && (
            <button 
              onClick={handleDashboardNavigation}
              className="w-full text-left hover:text-orange-600 transition-colors py-1 flex items-center gap-1 text-gray-800 text-sm"
              title="My Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" /> 
              {showMerchantNav ? 'Merchant Dashboard' : 'My Dashboard'}
            </button>
          )}
          
          {/* Profile Link for Authenticated Users in Mobile Menu */}
          {isAuthenticated && (
            <Link 
              to={showMerchantNav ? "/merchant/profile/edit" : "/profile"}
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-orange-600 transition-colors py-1 flex items-center gap-1 text-gray-800 text-sm"
              title="My Profile"
            >
              <User className="w-4 h-4" /> 
              {showMerchantNav ? 'Merchant Profile' : 'My Profile'}
            </Link>
          )}
          
          {/* Conditionally render wishlist in mobile menu only when authenticated AND not merchant */}
          {isAuthenticated && !showMerchantNav && isRegularUser && (
            <Link 
              to="/favorites" 
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-orange-600 transition-colors py-1 flex items-center gap-1 text-gray-800 text-sm"
              title="My Wishlist"
            >
              <Heart className="w-4 h-4" /> My Wishlist
            </Link>
          )}
          
          {/* Shopping Cart for regular users */}
          {!showMerchantNav && isRegularUser && (
            <Link 
              to="/cart" 
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-orange-600 transition-colors py-1 flex items-center gap-1 text-gray-800 text-sm"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" /> Shopping Cart
            </Link>
          )}
          
          {/* Show appropriate CTA button */}
          {showMerchantNav ? (
            <button
              onClick={() => {
                const fullUrl = window.location.origin;
                window.open(fullUrl, '_blank');
                setIsMenuOpen(false);
              }}
              className="block w-full bg-orange-600 text-white px-3 py-2 rounded-[14px] text-center font-semibold hover:bg-orange-700 transition-colors text-sm mt-2"
              title="Open Shopping Site in New Tab"
            >
              Shop Products
            </button>
          ) : isRegularUser ? (
            <Link 
              to="/auth/register/merchant" 
              onClick={() => setIsMenuOpen(false)}
              className="block bg-orange-600 text-white px-3 py-2 rounded-[14px] text-center font-semibold hover:bg-orange-700 transition-colors text-sm mt-2"
              title="Become a Seller on Nairobi Verified"
            >
              Sell on Nairobi Verified
            </Link>
          ) : null}
          
          {/* Auth Section for Mobile */}
          <div className="pt-2 border-t border-gray-200 mt-2">
            <ul className="space-y-1">
              {isAuthenticated ? (
                <li>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left hover:text-orange-600 transition-colors py-1 flex items-center gap-1 text-gray-800 text-sm"
                    title="Logout from Nairobi Verified"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </li>
              ) : (
                <li>
                  <Link 
                    to="/auth" 
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-orange-600 transition-colors py-1 flex items-center gap-1 text-gray-800 text-sm"
                    title="Sign In to Nairobi Verified"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Categories Modal */}
      {renderMobileCategoriesModal()}
    </>
  );
};

export default Navbar;