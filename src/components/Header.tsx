import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'merchant' | 'admin'>('user');

  // Mock login status - in real app, this would come from auth context
  const mockLogin = (role: 'user' | 'merchant' | 'admin') => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('user');
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'merchant':
        return '/merchant/dashboard';
      default:
        return '/dashboard';
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
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight font-garamond group-hover:text-primary transition-colors">Nairobi Verified</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/merchants" className="text-gray-700 hover:text-primary transition-colors">
              Merchants
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {userRole === 'user' && (
                  <Link to="/favorites" className="text-gray-700 hover:text-primary transition-colors">
                    Favorites
                  </Link>
                )}
                
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                
                <Link to="/profile" className="text-gray-700 hover:text-primary transition-colors">
                  Profile
                </Link>
                
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="outline">Sign In</Button>
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
            
            {isLoggedIn ? (
              <div className="space-y-4 pt-4 border-t">
                {userRole === 'user' && (
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
                
                <Link 
                  to="/profile" 
                  className="block text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                
                <Button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }} 
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
                <Link to="/auth/register/merchant" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary-dark">Register Business</Button>
                </Link>
              </div>
            )}
            
            {/* Mock login buttons for demo */}
            {!isLoggedIn && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm text-gray-500">Demo Login:</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => mockLogin('user')}>User</Button>
                  <Button size="sm" variant="outline" onClick={() => mockLogin('merchant')}>Merchant</Button>
                  <Button size="sm" variant="outline" onClick={() => mockLogin('admin')}>Admin</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
