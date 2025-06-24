import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold inter text-white mb-4">
              <span className="text-primary">Nairobi</span>
              <span className="text-secondary"> Verified</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Your trusted marketplace for verified merchants in Nairobi CBD. 
              Shop with confidence knowing every business is verified.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/merchants" className="hover:text-primary transition-colors">Browse Products</a></li>
              <li><a href="/merchants" className="hover:text-primary transition-colors">Verified Merchants</a></li>
              <li><a href="/categories" className="hover:text-primary transition-colors">Categories</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="/safety-guidelines" className="hover:text-primary transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>

          {/* For Merchants */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">For Merchants</h4>
            <ul className="space-y-2">
              <li><a href="/auth/register/merchant" className="hover:text-primary transition-colors">Become a Merchant</a></li>
              <li><a href="/merchant/verification" className="hover:text-primary transition-colors">Verification Process</a></li>
              <li><a href="/merchant/subscription-plans" className="hover:text-primary transition-colors">Subscription Plans</a></li>
              <li><a href="/merchant/dashboard" className="hover:text-primary transition-colors">Merchant Dashboard</a></li>
              <li><a href="/support" className="hover:text-primary transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-primary mr-3" />
                <span className="text-sm">Kiambu Road, Nairobi Kenya</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-3" />
                <span className="text-sm">0790120841 / 0713740807</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <span className="text-sm">info@sikosmarketing.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 Nairobi Verified. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy-policy" className="text-sm text-gray-400 hover:text-primary">Privacy Policy</a>
            <a href="/terms-of-service" className="text-sm text-gray-400 hover:text-primary">Terms of Service</a>
            <a href="/cookie-policy" className="text-sm text-gray-400 hover:text-primary">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
