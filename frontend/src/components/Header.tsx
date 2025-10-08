import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Store
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
  const { favoritesCount } = useFavorites(); // Get favorites count from context

  // Get auth state from context
  const { user, isAuthenticated, logout } = useAuth();

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
  };

  const getUserDisplayName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  // Function to determine dashboard URL based on user role
  const getDashboardUrl = () => {
    if (user?.role === 'merchant') {
      return '/merchant/dashboard';
    }
    return '/dashboard';
  };

  return (
  <nav 
  ref={navbarRef}
  className={`fixed w-full top-0 z-50 transition-all duration-300 max-h-[150px] text-[15px] bg-[white] ${
    scrolled ? 'shadow-lg bg-opacity-95 backdrop-blur-sm' : 'shadow-md'
  }`}
  aria-label="Main navigation"
>
  {/* Top Row - Logo, Search, Icons */}
  <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-h-[90px]">
    {/* Logo */}
    <Link 
      to="/" 
      className="flex items-center space-x-3 group"
      title="Nairobi Verified - Home"
    >
      <img
        src="/Nairobi Verified Logo.png"
        alt="Nairobi Verified Logo"
        className="w-22 h-12 object-contain rounded-[16px] shadow-sm transition-transform group-hover:scale-105"
      />
    </Link>

    {/* Search Bar (Desktop) */}
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

    {/* User Options */}
    <div className="flex items-center space-x-2 sm:space-x-4">
      {isAuthenticated ? (
        <>
          {/* User Dropdown */}
          <div className="relative group">
            <button className="hidden sm:flex items-center space-x-2 text-grey hover:text-[#EC5C0A] transition-colors p-2 rounded-[14px] hover:bg-[#FEEED5]">
              <div className="p-1 rounded-full bg-[#FEEED5] text-gray">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm text-gray">Hello, {getUserDisplayName()}</span>
              <ChevronDown className="w-5 h-5 text-[#EC5C0A]" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 rounded-[16px] bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
              <Link 
                to={getDashboardUrl()}
                className="block px-4 py-3 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors border-b border-gray-100"
                title="My Dashboard"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </div>
              </Link>
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
      
      {/* Conditionally render wishlist only when authenticated */}
      {isAuthenticated && (
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
      
      <Link 
        to="/cart" 
        className="hover:scale-110 transition-transform duration-200 text-gray text-xl bg-[#FEEED5] p-2 rounded-[16px] relative"
        title="Shopping Cart"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 bg-[#EC5C0A] text-xs text-white font-bold rounded-[16px] w-5 h-5 flex items-center justify-center">0</span>
      </Link>
    </div>
  </div>

  {/* Desktop Navigation Links */}
  <div className="hidden md:flex items-center justify-between px-6 py-2 border-t border-gray-200 text-gray text-base">
    <ul className="flex space-x-6 p-2">
      <li>
        <Link 
          to="/products" 
          className="hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90 text-[#EC5C0A]"
          title="Hot Deals and Special Offers"
        >
          Hot Deals <Zap className="text-[#EC5C0A] w-4 h-4" />
        </Link>
      </li>
      
      <li className="relative group">
        <button 
          className="hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90"
          title="Browse Product Categories"
        >
          Categories <ChevronDown className="w-4 h-4" />
        </button>
        <ul className="absolute left-0 mt-2 w-48 rounded-[16px] bg-white text-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100 text-base">
          <li>
            <Link 
              to="/products?category=electronics" 
              className="block px-4 py-2.5 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors"
              title="Electronics Products"
            >
              Electronics
            </Link>
          </li>
          <li>
            <Link 
              to="/products?category=fashion" 
              className="block px-4 py-2.5 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors"
              title="Fashion and Clothing"
            >
              Fashion
            </Link>
          </li>
          <li>
            <Link 
              to="/products?category=home" 
              className="block px-4 py-2.5 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors"
              title="Home and Kitchen Products"
            >
              Home & Kitchen
            </Link>
          </li>
          <li>
            <Link 
              to="/products?category=beauty" 
              className="block px-4 py-2.5 hover:bg-[#FEEED5] hover:text-[#EC5C0A] transition-colors"
              title="Beauty and Cosmetics"
            >
              Beauty
            </Link>
          </li>
        </ul>
      </li>
      
      <li>
        <Link 
          to="/merchants" 
          className="hover:text-gray-700 transition-colors font-semibold opacity-90"
          title="Find Verified Vendors and Merchants"
        >
       <span style={{ 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: '2px' 
}}>
  Shops <Store size={16} fill='#fff'  />
</span>

        </Link>
      </li>
      
      <li>
        <Link 
          to="/about" 
          className="hover:text-gray-700 transition-colors font-semibold opacity-90"
          title="About Nairobi Verified"
        >
          About
        </Link>
      </li>
    </ul>

    <ul className="flex items-center space-x-6">
      <li>
        <Link 
          to="/support" 
          className="hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90 text-[#EC5C0A]"
          title="Contact Support"
        >
          <Phone className="w-4 h-4 text-[#EC5C0A]"  /> Contact Us
        </Link>
      </li>
                  
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
    
    {/* Mobile Search */}
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
  </div>

  {/* Mobile Menu */}
  <div 
    className={`px-6 py-4 bg-white md:hidden space-y-4 text-gray-800 font-medium shadow-lg transition-all duration-300 ${
      isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
    }`}
    aria-hidden={!isMenuOpen}
  >
    <Link 
      to="/products" 
      onClick={() => setIsMenuOpen(false)}
      className="hover:text-[#EC5C0A] transition-colors flex items-center gap-1 text-[#EC5C0A]"
      title="Hot Deals and Special Offers"
    >
      Hot Deals <Zap className="text-[#EC5C0A] w-4 h-4" />
    </Link>
    
    <div>
      <span className="font-bold block mb-2 text-gray-900">Categories</span>
      <ul className="space-y-1">
        <li>
          <Link 
            to="/products?category=electronics" 
            onClick={() => setIsMenuOpen(false)}
            className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
            title="Electronics Products"
          >
            Electronics
          </Link>
        </li>
        <li>
          <Link 
            to="/products?category=fashion" 
            onClick={() => setIsMenuOpen(false)}
            className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
            title="Fashion and Clothing"
          >
            Fashion
          </Link>
        </li>
        <li>
          <Link 
            to="/products?category=home" 
            onClick={() => setIsMenuOpen(false)}
            className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
            title="Home and Kitchen Products"
          >
            Home & Kitchen
          </Link>
        </li>
        <li>
          <Link 
            to="/products?category=beauty" 
            onClick={() => setIsMenuOpen(false)}
            className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
            title="Beauty and Cosmetics"
          >
            Beauty
          </Link>
        </li>
      </ul>
    </div>
    
    <Link
      to="/merchants" 
      onClick={() => setIsMenuOpen(false)}
      className="block hover:text-[#EC5C0A] transition-colors"
      title="Find Verified Vendors and Merchants"
    >
     <span style={{ 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: '2px' 
}}>
  Shops <Store size={15} fill='#fff'  />
</span>

    </Link>
    
    <Link 
      to="/about" 
      onClick={() => setIsMenuOpen(false)}
      className="block hover:text-[#EC5C0A] transition-colors"
      title="About Nairobi Verified"
    >
      About
    </Link>
    
    {/* Dashboard Link for Authenticated Users in Mobile Menu */}
    {isAuthenticated && (
      <Link 
        to={getDashboardUrl()}
        onClick={() => setIsMenuOpen(false)}
        className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
        title="My Dashboard"
      >
        <LayoutDashboard className="w-4 h-4" /> Dashboard
      </Link>
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
    
    {/* Conditionally render wishlist in mobile menu only when authenticated */}
    {isAuthenticated && (
      <Link 
        to="/favorites" 
        onClick={() => setIsMenuOpen(false)}
        className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
        title="My Wishlist"
      >
        <Heart className="w-4 h-4" /> My Wishlist
      </Link>
    )}
    
    <Link 
      to="/auth/register/merchant" 
      onClick={() => setIsMenuOpen(false)}
      className="block bg-[#EC5C0A] text-white px-4 py-2 rounded-[16px] text-center font-semibold hover:bg-[#fb923c] transition-colors"
      title="Become a Seller on Nairobi Verified"
    >
      Sell on Nairobi Verified
    </Link>
    
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
        <li>
          <Link 
            to="/support" 
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1 text-[#EC5C0A]"
            title="Contact Support"
          >
            <Phone className="w-4 h-4 text-[#EC5C0A]" /> Contact Us
          </Link>
        </li>
      </ul>
    </div>
  </div>
</nav>
  );
};

export default Navbar;