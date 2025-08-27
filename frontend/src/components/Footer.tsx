import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl md:text-2xl font-bold inter text-white mb-3 md:mb-4">
              <span className="text-primary">Nairobi</span>
              <span className="text-secondary"> Verified</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4 leading-tight md:leading-normal">
              Your trusted marketplace for verified merchants in Nairobi CBD. 
              Shop with confidence knowing every business is verified.
            </p>
            <div className="flex justify-center sm:justify-start space-x-3 md:space-x-4">
              <Facebook className="h-4 w-4 md:h-5 md:w-5 hover:text-primary cursor-pointer" />
              <Twitter className="h-4 w-4 md:h-5 md:w-5 hover:text-primary cursor-pointer" />
              <Instagram className="h-4 w-4 md:h-5 md:w-5 hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
              <li><Link to="/products" className="hover:text-primary transition-colors">Browse Products</Link></li>
              <li><Link to="/merchants" className="hover:text-primary transition-colors">Verified Merchants</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/safety-guidelines" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
            </ul>
          </div>

          {/* For Merchants */}
          <div className="text-center sm:text-left">
            <h4 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">For Merchants</h4>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
              <li><Link to="/auth/register/merchant" className="hover:text-primary transition-colors">Become a Merchant</Link></li>
              <li><Link to="/merchant/verification" className="hover:text-primary transition-colors">Verification Process</Link></li>
              <li><Link to="/merchant/subscription-plans" className="hover:text-primary transition-colors">Subscription Plans</Link></li>
              <li><Link to="/merchant/dashboard" className="hover:text-primary transition-colors">Merchant Dashboard</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Support Center</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Contact Us</h4>
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <div className="flex items-center justify-center sm:justify-start">
                <MapPin className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2" />
                <span>Kiambu Road, Nairobi</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <Phone className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2" />
                <span>0790120841 / 0713740807</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <Mail className="h-3 w-3 md:h-4 md:w-4 text-primary mr-2" />
                <span>info@nairobiverified.com</span>
              </div>
              <div className="mt-3 md:mt-4 flex justify-center sm:justify-start space-x-2">
                <Link to="/contact" className="text-primary hover:text-primary-dark underline">
                  Contact
                </Link>
                <span>•</span>
                <Link to="/status" className="text-primary hover:text-primary-dark underline">
                  Status
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-4 md:pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs md:text-sm text-gray-400 order-2 md:order-1 mt-3 md:mt-0">
            © 2025 Nairobi Verified. All rights reserved.
          </p>
          <div className="flex space-x-4 md:space-x-6 order-1 md:order-2">
            <Link to="/privacy-policy" className="text-xs md:text-sm text-gray-400 hover:text-primary">Privacy</Link>
            <Link to="/terms-of-service" className="text-xs md:text-sm text-gray-400 hover:text-primary">Terms</Link>
            <Link to="/cookie-policy" className="text-xs md:text-sm text-gray-400 hover:text-primary">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;