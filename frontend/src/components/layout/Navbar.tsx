"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiShoppingCart, FiUser, FiChevronDown, FiX, FiMenu } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/Nairobi Verified Logo.png"
                alt="Nairobi Verified"
                width={48}
                height={48}
                className="h-10 w-auto"
                priority
              />
              <span className="ml-3 text-2xl font-bold text-orange-600">Nairobi Verified</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-orange-600 font-medium transition duration-150">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-orange-600 font-medium transition duration-150">
              Categories
            </Link>
            <Link href="/merchants" className="text-gray-700 hover:text-orange-600 font-medium transition duration-150">
              Merchants
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 font-medium transition duration-150">
              About
            </Link>
          </div>

          {/* Search, Cart, and User Menu */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-orange-600 transition duration-150"
                aria-label="Search"
              >
                <FiSearch className="h-5 w-5" />
              </button>
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl p-4 border border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products, categories..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button className="absolute right-3 top-2.5 text-gray-400 hover:text-orange-600">
                      <FiSearch className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="p-2 text-gray-600 hover:text-orange-600 relative transition duration-150" aria-label="Shopping Cart">
              <FiShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-gray-600 hover:text-orange-600 transition duration-150 flex items-center"
                aria-label="User menu"
              >
                <FiUser className="h-5 w-5" />
                <span className="hidden md:block ml-2 text-sm font-medium">
                  {user ? user.name || 'Account' : 'Sign In'}
                </span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-150"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-150"
                      >
                        Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-150"
                      >
                        Wishlist
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-150"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-150"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-150"
                      >
                        Sign Up
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link
                        href="/help-center"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition duration-150"
                      >
                        Help Center
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-orange-600 transition duration-150"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 pt-3 pb-4 space-y-2">
            <Link
              href="/products"
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/merchants"
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              Merchants
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition duration-150"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="border-t border-gray-100 my-2"></div>
            {!user && (
              <div className="flex space-x-2 mt-3">
                <Link
                  href="/auth/signin"
                  className="flex-1 px-4 py-2 text-center text-white bg-orange-600 rounded-md hover:bg-orange-700 transition duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1 px-4 py-2 text-center text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition duration-150"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 