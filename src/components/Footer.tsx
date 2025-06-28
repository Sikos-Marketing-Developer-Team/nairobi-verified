import React from 'react';
import { Link } from 'react-router-dom';
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
              <li><Link to="/products" className="hover:text-primary transition-colors">Browse Products</Link></li>
              <li><Link to="/merchants" className="hover:text-primary transition-colors">Verified Merchants</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/safety-guidelines" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
            </ul>
          </div>

          {/* For Merchants */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">For Merchants</h4>
            <ul className="space-y-2">
              <li><Link to="/auth/register/merchant" className="hover:text-primary transition-colors">Become a Merchant</Link></li>
              <li><Link to="/merchant/verification" className="hover:text-primary transition-colors">Verification Process</Link></li>
              <li><Link to="/merchant/subscription-plans" className="hover:text-primary transition-colors">Subscription Plans</Link></li>
              <li><Link to="/merchant/dashboard" className="hover:text-primary transition-colors">Merchant Dashboard</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Support Center</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-primary mr-3" />
                <span className="text-sm">Tom Mboya Street, Nairobi CBD</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-3" />
                <span className="text-sm">0790120841 / 0713740807</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <span className="text-sm">info@nairobiverified.com</span>
              </div>
              <div className="mt-4">
                <Link to="/contact" className="text-primary hover:text-primary-dark text-sm underline">
                  Contact Form
                </Link>
                {" • "}
                <Link to="/status" className="text-primary hover:text-primary-dark text-sm underline">
                  Service Status
                </Link>
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
            <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-primary">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm text-gray-400 hover:text-primary">Terms of Service</Link>
            <Link to="/cookie-policy" className="text-sm text-gray-400 hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
