
// Old Navbar for reference
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') {
      return '/admin/dashboard';
    } else if (user?.isMerchant || user?.businessName) {
      return '/merchant/dashboard';
    } else {
      return '/dashboard';
    }
  };

  const getUserDisplayName = () => {
    if (user?.businessName) {
      return user.businessName;
    } else if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.name) {
      return user.name;
    } else {
      return user?.email || 'User';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/Nairobi Verified Logo.png"
              alt="Nairobi Verified Logo"
              className="w-10 h-10 object-contain rounded-lg shadow-sm transition-transform group-hover:scale-105"
            />
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight inter group-hover:text-primary transition-colors">Nairobi Verified</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/merchants" className="text-gray-700 hover:text-primary transition-colors">
              Merchants
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {(!user?.isMerchant && !user?.businessName && user?.role !== 'admin') && (
                  <Link to="/favorites" className="text-gray-700 hover:text-primary transition-colors">
                    Favorites
                  </Link>
                )}
                
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{getUserDisplayName()}</span>
                </div>
                
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="outline">Sign Up</Button>
                </Link>
                <Link to="/auth/register/merchant">
                  <Button className="bg-primary hover:bg-primary-dark">Register Business</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link 
              to="/merchants" 
              className="block text-gray-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Merchants
            </Link>
            <Link 
              to="/about" 
              className="block text-gray-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {isAuthenticated ? (
              <div className="space-y-4 pt-4 border-t">
                {(!user?.isMerchant && !user?.businessName && user?.role !== 'admin') && (
                  <Link 
                    to="/favorites" 
                    className="block text-gray-700 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                )}
                
                <Link 
                  to={getDashboardLink()} 
                  className="block text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{getUserDisplayName()}</span>
                </div>
                
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign Up</Button>
                </Link>
                <Link to="/auth/register/merchant" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary-dark">Register Business</Button>
                </Link>
              </div>
            )}

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;