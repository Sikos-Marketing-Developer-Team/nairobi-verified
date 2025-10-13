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

  // Smart route detection
  const isMerchantRoute = location.pathname.startsWith('/merchant/');
  
  // Show merchant navbar for merchants on merchant routes
  const showMerchantNav = isAuthenticated && 
    (user?.role === 'merchant' || user?.role === 'admin') && 
    isMerchantRoute;

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

  const getUserDisplayName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  // CORRECTED: Smart dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!isAuthenticated || !user) {
      return '/auth';
    }
    
    // Merchant users go to merchant dashboard
    if (user.role === 'merchant' || user.role === 'admin') {
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

  // Merchant-specific navigation items - ONLY EXISTING ROUTES
  const merchantNavItems = [
    { path: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/merchant/profile/edit', label: 'Profile', icon: User },
    { path: '/merchant/verification', label: 'Verification', icon: Shield },
  ];

  // User navigation items - ONLY EXISTING ROUTES
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

  // Get current navigation items based on context
  const getNavItems = () => {
    return showMerchantNav ? merchantNavItems : userNavItems;
  };

  // Render navigation items for desktop
  const renderDesktopNavItems = () => {
    const items = getNavItems();
    
    return items.map((item) => {
      if (item.hasDropdown && !showMerchantNav) {
        return (
          <li key={item.label} className="relative group">
            <button 
              className="hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90"
              title={`Browse ${item.label}`}
            >
              {item.label} <ChevronDown className="w-4 h-4" />
            </button>
            <ul className="absolute left-0 mt-2 w-48 rounded-[16px] bg-white text-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100 text-base">
              {item.dropdownItems.map((dropdownItem) => (
                <li key={dropdownItem.label}>
                  <Link 
                    to={dropdownItem.path}
                    className="block px-4 py-2.5 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors"
                    title={dropdownItem.label}
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
            className={`hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90 ${
              item.highlight ? 'text-[#EC5C0A]' : ''
            }`}
            title={item.label}
          >
            {item.icon && <item.icon className={`w-4 h-4 ${item.highlight ? 'text-[#EC5C0A]' : ''}`} />}
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
                    onClick={() => setIsMenuOpen(false)}
                    className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
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
          onClick={() => setIsMenuOpen(false)}
          className={`block hover:text-[#EC5C0A] transition-colors ${
            item.highlight ? 'text-[#EC5C0A]' : ''
          }`}
          title={item.label}
        >
          {item.label}
        </Link>
      );
    });
  };

  return (
    <nav 
      ref={navbarRef}
      className={`fixed w-full top-0 z-50 transition-all duration-300 max-h-[150px] text-[15px] bg-[white] ${
        scrolled ? 'shadow-lg bg-opacity-95 backdrop-blur-sm' : 'shadow-md'
      } ${showMerchantNav ? 'merchant-nav' : 'user-nav'}`}
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
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
              Merchant
            </span>
          )}
        </Link>

        {/* Search Bar (Desktop) - Only show for users */}
        {!showMerchantNav && (
          <div className="hidden md:flex items-center bg-white rounded-[16px] px-4 py-2 w-1/2 max-w-lg shadow-sm hover:shadow-md transition-shadow relative border border-[#F97316]"
            style={{ minWidth: "300px" }}
          >
            <Search className="text-gray-500 w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search items, products, shops ... (Ctrl+K)"
              className="ml-2 flex-grow outline-none text-gray-700 placeholder-gray-500"
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
              className="bg-[#EC5C0A] text-white px-4 py-1 rounded-[16px] hover:bg-[#fb923c] transition-colors"
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
          <div className="hidden md:flex items-center justify-center w-1/2 max-w-lg"
            style={{ minWidth: "300px" }}
          >
            <span className="text-gray-500 text-sm">Merchant Business Portal</span>
          </div>
        )}

        {/* User Options */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated ? (
            <>
              {/* User Dropdown */}
              <div className="relative group">
                <button className="hidden sm:flex items-center space-x-2 text-grey hover:text-[#EC5C0A] transition-colors p-2 rounded-[14px] hover:bg-[#FEEED5]">
                  <div className={`p-1 rounded-full ${showMerchantNav ? 'bg-blue-100' : 'bg-[#FEEED5]'} text-gray`}>
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray">Hello, {getUserDisplayName()}</span>
                  <ChevronDown className="w-5 h-5 text-[#EC5C0A]" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 rounded-[16px] bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
                  <button 
                    onClick={handleDashboardNavigation}
                    className="block w-full text-left px-4 py-3 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors border-b border-gray-100"
                    title="My Dashboard"
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      {user?.role === 'merchant' || user?.role === 'admin' ? 'Merchant Dashboard' : 'My Dashboard'}
                    </div>
                  </button>
                  <Link 
                    to="/profile"
                    className="block px-4 py-3 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors border-b border-gray-100"
                    title="My Profile"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      My Profile
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors"
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
              className="hidden sm:flex items-center gap-1 bg-[#EC5C0A] hover:bg-[#fb923c] transition-colors text-white font-semibold px-3 py-1.5 rounded-[16px]"
              title="Sign In to Nairobi Verified"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
          
          {/* Conditionally render wishlist only when authenticated AND not merchant view */}
          {isAuthenticated && !showMerchantNav && (
            <Link 
              to="/favorites" 
              className="hover:scale-110 transition-transform duration-200 text-gray text-xl bg-[#FEEED5] p-2 rounded-[16px] relative"
              title="My Favorite Shops"
            >
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#EC5C0A] text-xs text-white font-bold rounded-[16px] w-5 h-5 flex items-center justify-center">
                {favoritesCount}
              </span>
            </Link>
          )}
          
          {/* Shopping Cart - Only show for users */}
          {!showMerchantNav && (
            <Link 
              to="/cart" 
              className="hover:scale-110 transition-transform duration-200 text-gray text-xl bg-[#FEEED5] p-2 rounded-[16px] relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#EC5C0A] text-xs text-white font-bold rounded-[16px] w-5 h-5 flex items-center justify-center">0</span>
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className={`hidden md:flex items-center justify-between px-6 py-2 border-t text-base ${
        showMerchantNav ? 'border-blue-200 text-blue-800' : 'border-gray-200 text-gray'
      }`}>
        <ul className="flex space-x-6 p-2">
          {renderDesktopNavItems()}
        </ul>

        <ul className="flex items-center space-x-6">
          <li>
            <Link 
              to="/contact" 
              className={`hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90 ${
                showMerchantNav ? 'text-blue-600' : 'text-[#EC5C0A]'
              }`}
              title="Contact Us"
            >
              <Phone className={`w-4 h-4 ${showMerchantNav ? 'text-blue-600' : 'text-[#EC5C0A]'}`} /> 
              Contact Us
            </Link>
          </li>
                      
          {/* Social Media Links - Only show for users */}
          {!showMerchantNav && (
            <li className="flex space-x-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:scale-110 transition-transform duration-200 text-gray bg-[#FEEED5] p-1.5 rounded-[16px] opacity-90"
                title="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4 text-[#EC5C0A]" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:scale-110 transition-transform duration-200 text-gray bg-[#FEEED5] p-1.5 rounded-[16px] opacity-90"
                title="Follow us on Twitter"
              >
                <Twitter className="w-4 h-4 text-[#EC5C0A]" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:scale-110 transition-transform duration-200 text-gray bg-[#FEEED5] p-1.5 rounded-[16px] opacity-90"
                title="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4 text-[#EC5C0A]" />
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Mobile Menu Toggle & Search */}
      <div className="flex md:hidden justify-between items-center px-4 py-2 border-t border-gray-200 text-gray">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray focus:outline-none text-xl bg-[#FEEED5] p-2 rounded-[16px]"
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
                className="w-full py-2 px-4 pl-10 rounded-[16px] text-gray-700 bg-white border border-[#F97316]"
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
            <span className="text-blue-600 text-sm font-medium">Business Portal</span>
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
          to="/contact" 
          onClick={() => setIsMenuOpen(false)}
          className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1 text-[#EC5C0A]"
          title="Contact Us"
        >
          <Phone className="w-4 h-4 text-[#EC5C0A]" /> Contact Us
        </Link>
        
        {/* Dashboard Link for Authenticated Users in Mobile Menu */}
        {isAuthenticated && (
          <button 
            onClick={handleDashboardNavigation}
            className="w-full text-left hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
            title="My Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" /> 
            {user?.role === 'merchant' || user?.role === 'admin' ? 'Merchant Dashboard' : 'My Dashboard'}
          </button>
        )}
        
        {/* Profile Link for Authenticated Users in Mobile Menu */}
        {isAuthenticated && (
          <Link 
            to="/profile"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
            title="My Profile"
          >
            <User className="w-4 h-4" /> My Profile
          </Link>
        )}
        
        {/* Conditionally render wishlist in mobile menu only when authenticated AND not merchant */}
        {isAuthenticated && !showMerchantNav && (
          <Link 
            to="/favorites" 
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
            title="My Wishlist"
          >
            <Heart className="w-4 h-4" /> My Wishlist
          </Link>
        )}
        
        {/* Sell on Nairobi Verified - Only show for users */}
        {!showMerchantNav && (
          <Link 
            to="/auth/register/merchant" 
            onClick={() => setIsMenuOpen(false)}
            className="block bg-[#EC5C0A] text-white px-4 py-2 rounded-[16px] text-center font-semibold hover:bg-[#fb923c] transition-colors"
            title="Become a Seller on Nairobi Verified"
          >
            Sell on Nairobi Verified
          </Link>
        )}
        
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
                    className="w-full text-left hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
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
                  className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
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