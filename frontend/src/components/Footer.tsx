import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';
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
  FaUndo,
  FaWhatsapp,
  FaLinkedin,
  FaYoutube,
  FaHeadset,
  FaShieldAlt,
  FaHandshake,
  FaStar
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white pt-16 pb-8 relative">
      {/* Curved top edge */}
      <div className="absolute top-0 left-0 right-0 transform -translate-y-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full h-auto">
          <path fill="#111827" fillOpacity="1" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z"></path>
        </svg>
      </div>
      
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-8 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Stay Updated</h3>
              <p className="text-white text-opacity-90 mb-0 md:pr-8">
                Subscribe to our newsletter for exclusive deals, vendor updates, and shopping tips.
              </p>
            </div>
            <div className="md:w-1/2 w-full">
              <form className="flex flex-col sm:flex-row gap-3 w-full">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-3 rounded-lg focus:outline-none text-gray-800"
                />
                <button 
                  type="submit" 
                  className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Column 1: About */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <OptimizedImage
                src="/images/logo.svg"
                alt="Nairobi Verified"
                width={180}
                height={90}
                style={{ objectFit: "contain" }}
              />
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Nairobi Verified is your trusted marketplace for authentic products and services in Kenya. 
              We connect shoppers with verified local vendors in Nairobi CBD, providing location guidance 
              and ensuring a seamless shopping experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="bg-gray-800 hover:bg-orange-600 text-white p-2.5 rounded-full transition-colors duration-300">
                <FaFacebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="bg-gray-800 hover:bg-orange-600 text-white p-2.5 rounded-full transition-colors duration-300">
                <FaTwitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="bg-gray-800 hover:bg-orange-600 text-white p-2.5 rounded-full transition-colors duration-300">
                <FaInstagram size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                className="bg-gray-800 hover:bg-orange-600 text-white p-2.5 rounded-full transition-colors duration-300">
                <FaLinkedin size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" 
                className="bg-gray-800 hover:bg-orange-600 text-white p-2.5 rounded-full transition-colors duration-300">
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-orange-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Home
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Hot Deals
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Find Vendors
                </Link>
              </li>
              <li>
                <Link href="/auth/register/merchant" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              Categories
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-orange-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/electronics" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Electronics
                </Link>
              </li>
              <li>
                <Link href="/categories/fashion" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Fashion
                </Link>
              </li>
              <li>
                <Link href="/categories/home-kitchen" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Home & Kitchen
                </Link>
              </li>
              <li>
                <Link href="/categories/beauty" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Beauty
                </Link>
              </li>
              <li>
                <Link href="/categories/health" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Health & Wellness
                </Link>
              </li>
              <li>
                <Link href="/categories/sports" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center">
                  <span className="mr-2">›</span> Sports & Outdoors
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-orange-500"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-orange-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">123 Business Avenue, Nairobi CBD, Kenya</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-orange-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+254 700 000 000</span>
              </li>
              <li className="flex items-center">
                <FaWhatsapp className="text-orange-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+254 700 000 000</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-orange-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">info@nairobiverifed.com</span>
              </li>
              <li className="flex items-center">
                <FaHeadset className="text-orange-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">Customer Support: 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 pt-10 pb-8">
          <h3 className="text-center text-lg font-bold mb-8 text-white">Why Shop With Us</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all duration-300">
              <FaShieldAlt className="text-orange-500 text-3xl mb-3 mx-auto" />
              <h4 className="text-sm font-medium mb-1">Secure Shopping</h4>
              <p className="text-xs text-gray-400">Your data is always protected</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all duration-300">
              <FaCreditCard className="text-orange-500 text-3xl mb-3 mx-auto" />
              <h4 className="text-sm font-medium mb-1">Multiple Payment Options</h4>
              <p className="text-xs text-gray-400">M-Pesa, Card, Bank Transfer</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all duration-300">
              <FaHandshake className="text-orange-500 text-3xl mb-3 mx-auto" />
              <h4 className="text-sm font-medium mb-1">Verified Vendors</h4>
              <p className="text-xs text-gray-400">All vendors are pre-screened</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 transition-all duration-300">
              <FaStar className="text-orange-500 text-3xl mb-3 mx-auto" />
              <h4 className="text-sm font-medium mb-1">Quality Guarantee</h4>
              <p className="text-xs text-gray-400">Satisfaction guaranteed</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} Nairobi Verified. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/privacy-policy" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Privacy Policy</Link>
              <Link href="/terms-conditions" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Terms & Conditions</Link>
              <Link href="/sitemap" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">Site Map</Link>
              <Link href="/faq" className="text-gray-500 text-sm hover:text-orange-500 transition-colors">FAQ</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-gray-600">
            <p>Designed and developed with ❤️ in Nairobi, Kenya</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;