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
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navbarRef = useRef(null);
  const searchInputRef = useRef(null);
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth state from context
  const { user, isAuthenticated, logout } = useAuth();

  // FIXED: User role handling - merchants always use merchant interface
  const isAdmin = user?.role === 'admin';
  const isMerchant = user?.role === 'merchant';
  const isRegularUser = isAuthenticated && !isMerchant && !isAdmin;
  
  // FIXED: Show merchant navbar for merchants/admins regardless of current route
  const showMerchantNav = isMerchant || isAdmin;

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
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // FIXED: Redirect merchants to merchant routes when they try to access user routes
  useEffect(() => {
    if (isAuthenticated && showMerchantNav) {
      // If merchant is on a user route, redirect to merchant equivalent or dashboard
      const userRoutes = ['/', '/products', '/merchants', '/about', '/contact', '/cart', '/favorites', '/dashboard'];
      const currentPath = location.pathname;
      
      if (userRoutes.includes(currentPath) || userRoutes.some(route => currentPath.startsWith(route))) {
        // For specific routes, create merchant equivalents
        if (currentPath === '/contact') {
          navigate('/merchant/contact', { replace: true });
        } else if (currentPath.startsWith('/products')) {
          navigate('/merchant/products', { replace: true });
        } else if (currentPath === '/merchants') {
          navigate('/merchant/competitors', { replace: true });
        } else if (currentPath !== '/merchant/dashboard') {
          // Default redirect to merchant dashboard for other user routes
          navigate('/merchant/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, showMerchantNav, location.pathname, navigate]);

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

  // FIXED: Merchant-specific navigation items - ONLY for merchant view
  const merchantNavItems = [
    { path: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/merchant/products', label: 'Products', icon: Store },
    { path: '/merchant/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/merchant/profile/edit', label: 'Profile', icon: User },
    { path: '/merchant/verification', label: 'Verification', icon: Shield },
    { path: '/merchant/contact', label: 'Contact Support', icon: Phone },
  ];

  // FIXED: User navigation items - ONLY for regular user view
  const userNavItems = [
    { path: '/products', label: 'Hot Deals', icon: Zap, highlight: true },
    { 
      path: '#', 
      label: 'Categories', 
      icon: ChevronDown, 
      hasDropdown: true,
      dropdownItems: [
        { path: '/products?category=electronics', label: 'Electronics' },
        { path: '/products?category=fashion', label: 'Fashion' },
        { path: '/products?category=home', label: 'Home & Kitchen' },
        { path: '/products?category=beauty', label: 'Beauty' },
      ]
    },
    { path: '/merchants', label: 'Shops', icon: Store },
    { path: '/about', label: 'About' },
  ];

  // FIXED: Get current navigation items based on context
  const getNavItems = () => {
    return showMerchantNav ? merchantNavItems : userNavItems;
  };

  // FIXED: Handle navigation for merchants to user routes in new tab/window
  const handleMerchantToUserRoute = (path, e) => {
    if (showMerchantNav) {
      e.preventDefault();
      // Open user routes in new tab for merchants
      const fullUrl = window.location.origin + path;
      window.open(fullUrl, '_blank');
    }
  };

  // Render navigation items for desktop
  const renderDesktopNavItems = () => {
    const items = getNavItems();
    
    return items.map((item) => {
      if (item.hasDropdown && !showMerchantNav) {
        return (
          <li key={item.label} className="relative group">
            <button 
              className="hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 text-gray-900"
              title={`Browse ${item.label}`}
            >
              {item.label} <ChevronDown className="w-4 h-4" />
            </button>
            <ul className="absolute left-0 mt-2 w-48 rounded-[16px] bg-white text-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100 text-base">
              {item.dropdownItems.map((dropdownItem) => (
                <li key={dropdownItem.label}>
                  <Link 
                    to={dropdownItem.path}
                    className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    title={dropdownItem.label}
                    onClick={(e) => showMerchantNav ? handleMerchantToUserRoute(dropdownItem.path, e) : null}
                  >
                    {dropdownItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      }

      return (
        <li key={item.path}>
          <Link 
            to={item.path}
            className={`hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 text-gray-900 ${
              item.highlight ? 'text-orange-600' : ''
            }`}
            title={item.label}
            onClick={(e) => {
              // For merchant-specific routes, no special handling needed
              if (item.path.startsWith('/merchant')) return;
              // For user routes when in merchant view, handle specially
              if (showMerchantNav) handleMerchantToUserRoute(item.path, e);
            }}
          >
            {item.icon && <item.icon className={`w-4 h-4 ${item.highlight ? 'text-orange-600' : 'text-gray-900'}`} />}
            {item.label}
          </Link>
        </li>
      );
    });
  };

  // Render mobile navigation items
  const renderMobileNavItems = () => {
    const items = getNavItems();
    
    return items.map((item) => {
      if (item.hasDropdown && !showMerchantNav) {
        return (
          <div key={item.label}>
            <span className="font-bold block mb-2 text-gray-900">{item.label}</span>
            <ul className="space-y-1">
              {item.dropdownItems.map((dropdownItem) => (
                <li key={dropdownItem.label}>
                  <Link 
                    to={dropdownItem.path}
                    onClick={(e) => {
                      if (showMerchantNav) {
                        e.preventDefault();
                        const fullUrl = window.location.origin + dropdownItem.path;
                        window.open(fullUrl, '_blank');
                      }
                      setIsMenuOpen(false);
                    }}
                    className="block pl-4 py-1.5 hover:text-orange-600 transition-colors text-gray-800"
                    title={dropdownItem.label}
                  >
                    {dropdownItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      return (
        <Link
          key={item.path}
          to={item.path}
          onClick={(e) => {
            // For merchant-specific routes, no special handling needed
            if (item.path.startsWith('/merchant')) {
              setIsMenuOpen(false);
              return;
            }
            // For user routes when in merchant view, handle specially
            if (showMerchantNav) {
              e.preventDefault();
              const fullUrl = window.location.origin + item.path;
              window.open(fullUrl, '_blank');
              setIsMenuOpen(false);
            } else {
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

  // FIXED: Debug info to see what's happening
  console.log('🔍 Navbar Debug:', {
    userRole: user?.role,
    isAuthenticated,
    showMerchantNav,
    isMerchant,
    isAdmin,
    isRegularUser,
    path: location.pathname
  });

  return (
    <nav 
      ref={navbarRef}
      className={`fixed w-full top-0 z-50 transition-all duration-300 max-h-[150px] text-[15px] bg-white ${
        scrolled ? 'shadow-lg bg-opacity-95 backdrop-blur-sm' : 'shadow-md'
      } ${showMerchantNav ? 'merchant-nav border-b border-gray-200' : 'user-nav'}`}
      aria-label="Main navigation"
    >
      {/* Top Row - Logo, Search, Icons */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-h-[90px]">
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

        {/* Search Bar (Desktop) - Only show for users */}
        {!showMerchantNav && (
          <div className="hidden md:flex items-center bg-white rounded-[16px] px-4 py-2 w-1/2 max-w-lg shadow-sm hover:shadow-md transition-shadow relative border border-orange-500"
            style={{ minWidth: "300px" }}
          >
            <Search className="text-gray-500 w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search items, products, shops ... (Ctrl+K)"
              className="ml-2 flex-grow outline-none text-gray-800 placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              aria-label="Search"
              title="Search products and vendors"
            />
            <button 
              type="button"
              onClick={handleSearch}
              className="bg-orange-600 text-white px-4 py-1 rounded-[16px] hover:bg-orange-700 transition-colors"
              aria-label="Submit search"
              title="Search"
            >
              Search
            </button>
            {isSearchFocused && (
              <div className="absolute right-4 top-4 items-center text-xs text-gray-500 hidden md:flex">
                <Keyboard className="mr-1 w-3 h-3" />
                <span>Esc to cancel</span>
              </div>
            )}
          </div>
        )}

        {/* Show placeholder when in merchant mode */}
        {showMerchantNav && (
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <span className="text-gray-700 font-semibold text-lg">Business Portal</span>
          </div>
        )}
    
        {/* User Options */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            <>
              {/* User Dropdown */}
              <div className="relative group">
                <button className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors p-2 rounded-[14px] hover:bg-orange-50">
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
              className="hover:scale-110 transition-transform duration-200 text-gray-700 text-xl bg-orange-50 p-2 rounded-[16px] relative"
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
              className="hover:scale-110 transition-transform duration-200 text-gray-700 text-xl bg-orange-50 p-2 rounded-[16px] relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-orange-600 text-xs text-white font-bold rounded-[16px] w-5 h-5 flex items-center justify-center">0</span>
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className={`hidden md:flex items-center justify-between px-6 py-2 border-t text-base ${
        showMerchantNav ? 'border-gray-200 bg-white text-gray-800' : 'border-gray-200 text-gray-800 bg-white'
      }`}>
        <ul className="flex space-x-6 p-2">
          {renderDesktopNavItems()}
        </ul>

        <ul className="flex items-center space-x-6">
          <li>
            <Link 
              to={showMerchantNav ? "/merchant/contact" : "/contact"}
              className={`hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 text-gray-900 ${
                showMerchantNav ? 'text-gray-700 hover:text-orange-600' : 'text-orange-600'
              }`}
              title="Contact Us"
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
          
          {/* Show "Switch to User View" for merchants on merchant routes */}
          {showMerchantNav && (
            <li>
              <button
                onClick={() => {
                  const fullUrl = window.location.origin;
                  window.open(fullUrl, '_blank');
                }}
                className="bg-orange-600 hover:bg-orange-700 transition-colors text-white font-semibold px-3 py-1.5 rounded-[16px] text-sm"
                title="Open Shopping Site in New Tab"
              >
                Shop Products
              </button>
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

      {/* Mobile Menu Toggle & Search */}
      <div className={`flex md:hidden justify-between items-center px-4 py-2 border-t text-gray-800 ${
        showMerchantNav ? 'border-gray-200 bg-white' : 'border-gray-200 bg-white'
      }`}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`text-gray-800 focus:outline-none text-xl p-2 rounded-[16px] ${
            showMerchantNav ? 'bg-gray-100 text-gray-700' : 'bg-orange-50'
          }`}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          title={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        {/* Mobile Search - Only show for users */}
        {!showMerchantNav && (
          <div className="flex-grow mx-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 pl-10 rounded-[16px] text-gray-800 bg-white border border-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Search"
                title="Search products and vendors"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
          </div>
        )}

        {/* Merchant placeholder on mobile */}
        {showMerchantNav && (
          <div className="flex-grow mx-2 text-center">
            <span className="text-gray-700 text-sm font-medium">Business Portal</span>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <div 
        className={`px-6 py-4 bg-white md:hidden space-y-4 text-gray-800 font-medium shadow-lg transition-all duration-300 ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        aria-hidden={!isMenuOpen}
      >
        {renderMobileNavItems()}
        
        {/* Contact Us */}
        <Link 
          to={showMerchantNav ? "/merchant/contact" : "/contact"} 
          onClick={() => setIsMenuOpen(false)}
          className="hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1 text-orange-600"
          title={showMerchantNav ? "Contact Support" : "Contact Us"}
        >
          <Phone className="w-4 h-4 text-orange-600" /> 
          {showMerchantNav ? 'Contact Support' : 'Contact Us'}
        </Link>
        
        {/* Dashboard Link for Authenticated Users in Mobile Menu */}
        {isAuthenticated && (
          <button 
            onClick={handleDashboardNavigation}
            className="w-full text-left hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1 text-gray-800"
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
            className="hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1 text-gray-800"
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
            className="hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1 text-gray-800"
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
            className="hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1 text-gray-800"
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
            className="block w-full bg-orange-600 text-white px-4 py-2 rounded-[16px] text-center font-semibold hover:bg-orange-700 transition-colors"
            title="Open Shopping Site in New Tab"
          >
            Shop Products
          </button>
        ) : isRegularUser ? (
          <Link 
            to="/auth/register/merchant" 
            onClick={() => setIsMenuOpen(false)}
            className="block bg-orange-600 text-white px-4 py-2 rounded-[16px] text-center font-semibold hover:bg-orange-700 transition-colors"
            title="Become a Seller on Nairobi Verified"
          >
            Sell on Nairobi Verified
          </Link>
        ) : null}
        
        <div className="pt-2 border-t border-gray-200 mt-2">
          <ul className="space-y-1">
            {isAuthenticated ? (
              <>
                <li className="flex items-center gap-2 text-gray-700 py-1.5">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Hello, {getUserDisplayName()}</span>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1 text-gray-800"
                    title="Logout from Nairobi Verified"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link 
                  to="/auth" 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1 text-gray-800"
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
  );
};

export default Navbar;