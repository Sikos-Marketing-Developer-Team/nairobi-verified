import React from 'react';
import Image from 'next/image';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaTiktok, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaCreditCard,
  FaLock,
  FaTruck,
  FaUndo
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/logo.webp"
                alt="Nairobi Verified"
                width={150}
                height={80}
                style={{ objectFit: "contain" }}
              />
            </div>
            <p className="text-gray-400 mb-4">
              Nairobi Verified is your trusted marketplace for authentic products and services in Kenya.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaTiktok size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#EC5C0B]">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/deals" className="text-gray-400 hover:text-white transition-colors">Hot Deals</a></li>
              <li><a href="/vendors" className="text-gray-400 hover:text-white transition-colors">Find Vendors</a></li>
              <li><a href="/auth/register/merchant" className="text-gray-400 hover:text-white transition-colors">Become a Vendor</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/sitemap" className="text-gray-400 hover:text-white transition-colors">Site Map</a></li>
              <li><a href="/ui-guide" className="text-gray-400 hover:text-white transition-colors">UI Style Guide</a></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#EC5C0B]">Categories</h3>
            <ul className="space-y-2">
              <li><a href="/electronics" className="text-gray-400 hover:text-white transition-colors">Electronics</a></li>
              <li><a href="/fashion" className="text-gray-400 hover:text-white transition-colors">Fashion</a></li>
              <li><a href="/home-kitchen" className="text-gray-400 hover:text-white transition-colors">Home & Kitchen</a></li>
              <li><a href="/beauty" className="text-gray-400 hover:text-white transition-colors">Beauty</a></li>
              <li><a href="/health" className="text-gray-400 hover:text-white transition-colors">Health & Wellness</a></li>
              <li><a href="/sports" className="text-gray-400 hover:text-white transition-colors">Sports & Outdoors</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#EC5C0B]">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <span className="text-gray-400">Nairobi, Kenya</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-gray-400" />
                <span className="text-gray-400">+254 700 000 000</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-gray-400" />
                <span className="text-gray-400">info@nairobiverifed.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 pt-8 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <FaLock className="text-[#EC5C0B] text-2xl mb-2" />
              <h4 className="text-sm font-medium">Secure Payment</h4>
              <p className="text-xs text-gray-400">Your data is protected</p>
            </div>
            <div className="flex flex-col items-center">
              <FaCreditCard className="text-[#EC5C0B] text-2xl mb-2" />
              <h4 className="text-sm font-medium">Multiple Payment Options</h4>
              <p className="text-xs text-gray-400">M-Pesa, Card, Bank Transfer</p>
            </div>
            <div className="flex flex-col items-center">
              <FaTruck className="text-[#EC5C0B] text-2xl mb-2" />
              <h4 className="text-sm font-medium">Fast Delivery</h4>
              <p className="text-xs text-gray-400">Nationwide shipping</p>
            </div>
            <div className="flex flex-col items-center">
              <FaUndo className="text-[#EC5C0B] text-2xl mb-2" />
              <h4 className="text-sm font-medium">Easy Returns</h4>
              <p className="text-xs text-gray-400">14-day return policy</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Nairobi Verified. All rights reserved.
            </p>
            <div className="mt-3 md:mt-0 flex space-x-4">
              <a href="/privacy-policy" className="text-gray-500 text-sm hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms-conditions" className="text-gray-500 text-sm hover:text-white transition-colors">Terms & Conditions</a>
              <a href="/sitemap" className="text-gray-500 text-sm hover:text-white transition-colors">Site Map</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;