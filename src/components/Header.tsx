// New Navbar

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Keyboard
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock auth state
  const navbarRef = useRef(null);
  const searchInputRef = useRef(null);

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
    setIsAuthenticated(false);
    setIsMenuOpen(false);
  };

  const getUserDisplayName = () => {
    return "John Doe"; // Mock user name
  };

  return (
    <nav 
      ref={navbarRef}
      className={`fixed w-full top-0 z-50 transition-all duration-300 max-h-[150px] text-[15px] bg-white ${
        scrolled ? 'shadow-lg bg-opacity-95 backdrop-blur-sm' : 'shadow-md'
      }`}
      aria-label="Main navigation"
    >
      {/* Top Row - Logo, Search, Icons */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-h-[90px]">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3 group">
          <img
            src="/Nairobi Verified Logo.png"
            alt="Nairobi Verified Logo"
            className="w-22 h-12 object-contain rounded-[7px] shadow-sm transition-transform group-hover:scale-105"
          />
        </a>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex items-center bg-white rounded-[7px] px-4 py-2 w-1/2 max-w-lg shadow-sm hover:shadow-md transition-shadow relative border border-[#F97316]"
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
          />
          <button 
            type="button"
            onClick={handleSearch}
            className="bg-[#EC5C0A] text-white px-4 py-1 rounded-[7px] hover:bg-[#fb923c] transition-colors"
            aria-label="Submit search"
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
              <div className="hidden sm:flex items-center space-x-2 text-black">
                <User className="h-4 w-4" />
                <span className="text-sm">{getUserDisplayName()}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1 bg-[#EC5C0A] hover:bg-[#fb923c] transition-colors text-white font-semibold px-3 py-1.5 rounded-[7px]"
              >
                Logout
              </button>
            </>
          ) : (
            <a 
              href="/auth" 
              className="hidden sm:flex items-center gap-1 bg-[#EC5C0A] hover:bg-[#fb923c] transition-colors text-white font-semibold px-3 py-1.5 rounded-[7px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </a>
          )}
          
          <a 
            href="/favorites" 
            className="hover:scale-110 transition-transform duration-200 text-black text-xl bg-[#FEF1E7] p-2 rounded-[7px] relative"
          >
            <Heart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#EC5C0A] text-xs text-white font-bold rounded-[7px] w-5 h-5 flex items-center justify-center">0</span>
          </a>
          
          <a 
            href="/cart" 
            className="hover:scale-110 transition-transform duration-200 text-black text-xl bg-[#FEF1E7] p-2 rounded-[7px] relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#EC5C0A] text-xs text-white font-bold rounded-[7px] w-5 h-5 flex items-center justify-center">0</span>
          </a>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center justify-between px-6 py-2 border-t border-gray-200 text-black text-sm">
        <ul className="flex space-x-6 p-2">
          <li>
            <a 
              href="/deals" 
              className="hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90"
            >
              Hot Deals <Zap className="text-gray-700 w-4 h-4" />
            </a>
          </li>
          
          <li className="relative group">
            <button className="hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90">
              Categories <ChevronDown className="w-4 h-4" />
            </button>
            <ul className="absolute left-0 mt-2 w-48 rounded-[7px] bg-white text-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
              <li>
                <a href="/categories/electronics" className="block px-4 py-2.5 hover:bg-[#FEF1E7] hover:text-[#EC5C0A] transition-colors">
                  Electronics
                </a>
              </li>
              <li>
                <a href="/categories/fashion" className="block px-4 py-2.5 hover:bg-[#FEF1E7] hover:text-[#EC5C0A] transition-colors">
                  Fashion
                </a>
              </li>
              <li>
                <a href="/categories/home" className="block px-4 py-2.5 hover:bg-[#FEF1E7] hover:text-[#EC5C0A] transition-colors">
                  Home & Kitchen
                </a>
              </li>
              <li>
                <a href="/categories/beauty" className="block px-4 py-2.5 hover:bg-[#FEF1E7] hover:text-[#EC5C0A] transition-colors">
                  Beauty
                </a>
              </li>
            </ul>
          </li>
          
          <li>
            <a href="/merchants" className="hover:text-gray-700 transition-colors font-semibold opacity-90">
              Find Vendors
            </a>
          </li>
          
          <li>
            <a href="/about" className="hover:text-gray-700 transition-colors font-semibold opacity-90">
              About
            </a>
          </li>
        </ul>

        <ul className="flex items-center space-x-6">
          <li>
            <a href="/contact" className="hover:text-gray-700 transition-colors font-semibold flex items-center gap-1 opacity-90">
              <Phone className="w-4 h-4" /> Contact Us
            </a>
          </li>
          
          <li>
            <a href="/orders" className="hover:text-gray-700 transition-colors font-semibold opacity-90">
              Track Order
            </a>
          </li>
          
          <li className="flex space-x-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200 text-black text-sm bg-[#FEF1E7] p-1.5 rounded-[7px] opacity-90">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200 text-black text-sm bg-[#FEF1E7] p-1.5 rounded-[7px] opacity-90">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200 text-black text-sm bg-[#FEF1E7] p-1.5 rounded-[7px] opacity-90">
              <Instagram className="w-4 h-4" />
            </a>
          </li>
        </ul>
      </div>

      {/* Mobile Menu Toggle & Search */}
      <div className="flex md:hidden justify-between items-center px-4 py-2 border-t border-gray-200 text-black">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-black focus:outline-none text-xl bg-[#FEF1E7] p-2 rounded-[7px]"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        {/* Mobile Search */}
        <div className="flex-grow mx-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 px-4 pl-10 rounded-[7px] text-gray-700 bg-white border border-[#F97316]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              aria-label="Search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <a href="/favorites" className="text-black text-xl relative bg-[#FEF1E7] p-2 rounded-[7px]">
            <Heart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#EC5C0A] text-xs text-white font-bold rounded-[7px] w-4 h-4 flex items-center justify-center">0</span>
          </a>
          <a href="/cart" className="text-black text-xl relative bg-[#FEF1E7] p-2 rounded-[7px]">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#EC5C0A] text-xs text-white font-bold rounded-[7px] w-4 h-4 flex items-center justify-center">0</span>
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`px-6 py-4 bg-white md:hidden space-y-4 text-gray-800 font-medium shadow-lg transition-all duration-300 ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <a 
          href="/deals" 
          onClick={() => setIsMenuOpen(false)}
          className="hover:text-[#EC5C0A] transition-colors flex items-center gap-1"
        >
          Hot Deals <Zap className="text-[#EC5C0A] w-4 h-4" />
        </a>
        
        <div>
          <span className="font-bold block mb-2 text-gray-900">Categories</span>
          <ul className="space-y-1">
            <li>
              <a 
                href="/categories/electronics" 
                onClick={() => setIsMenuOpen(false)}
                className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
              >
                Electronics
              </a>
            </li>
            <li>
              <a 
                href="/categories/fashion" 
                onClick={() => setIsMenuOpen(false)}
                className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
              >
                Fashion
              </a>
            </li>
            <li>
              <a 
                href="/categories/home" 
                onClick={() => setIsMenuOpen(false)}
                className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
              >
                Home & Kitchen
              </a>
            </li>
            <li>
              <a 
                href="/categories/beauty" 
                onClick={() => setIsMenuOpen(false)}
                className="block pl-4 py-1.5 hover:text-[#EC5C0A] transition-colors"
              >
                Beauty
              </a>
            </li>
          </ul>
        </div>
        
        <a
          href="/merchants" 
          onClick={() => setIsMenuOpen(false)}
          className="block hover:text-[#EC5C0A] transition-colors"
        >
          Find Vendors
        </a>
        
        <a 
          href="/about" 
          onClick={() => setIsMenuOpen(false)}
          className="block hover:text-[#EC5C0A] transition-colors"
        >
          About
        </a>
        
        <a 
          href="/auth/register/merchant" 
          onClick={() => setIsMenuOpen(false)}
          className="block bg-[#EC5C0A] text-white px-4 py-2 rounded-[7px] text-center font-semibold hover:bg-[#fb923c] transition-colors"
        >
          Sell on Nairobi Verified
        </a>
        
        <div className="pt-2 border-t border-gray-200 mt-2">
          <ul className="space-y-1">
            {isAuthenticated ? (
              <>
                <li className="flex items-center gap-2 text-gray-700 py-1.5">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{getUserDisplayName()}</span>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left hover:text-[#EC5C0A] transition-colors py-1.5"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <a 
                  href="/auth" 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </a>
              </li>
            )}
            <li>
              <a 
                href="/contact" 
                onClick={() => setIsMenuOpen(false)}
                className="hover:text-[#EC5C0A] transition-colors py-1.5 flex items-center gap-1"
              >
                <Phone className="w-4 h-4" /> Contact Us
              </a>
            </li>
            <li>
              <a 
                href="/orders" 
                onClick={() => setIsMenuOpen(false)}
                className="block hover:text-[#EC5C0A] transition-colors py-1.5"
              >
                Track Order
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;