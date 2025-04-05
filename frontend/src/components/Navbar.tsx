import { useState } from "react";
import Image from "next/image";
import {
  FaStore,
  FaHeart,
  FaShoppingCart,
  FaPhone,
  FaBolt,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaSearch,
  FaUser,
} from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar bg-[#EC5C0B] text-white shadow-md ">
      {/* Top Row - Logo, Search, Icons */}
      <div className="top-row flex items-center justify-between px-6 py-3 ">
        {/* Nairobi Verified Logo */}
        <div>
          <a href="/">
            <Image
              src="/images/logo.webp"
              alt="Nairobi Verified"
              width={130}
              height={70}
              title="home"
              loading="eager"
              style={{ objectFit: "contain" }}
            />
          </a>
        </div>

        {/* 🔍 Search Bar (Centered) */}
        <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 w-1/2 max-w-lg overflow-hidden" style={{ transition: "width 0.3s ease", minWidth: "300px" }}>
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search items, products, shops ..."
            className="ml-2 flex-grow outline-none text-gray-700"
          />
          <button className="bg-[#000000] text-white px-4 py-1 rounded-full hover:bg-[#EC5C0B]">
            Search
          </button>
        </div>

        {/* User Options */}
        <div className="flex items-center space-x-6 ">
          <a href="/auth/register/client" title="client account" className="hover:underline">
            <span className="inline-flex items-center gap-1">
              <FaUser /> Buyer
            </span>
          </a>
          <a href="/auth/register/merchant" title="merchant account" className="hover:underline">
            <span className="inline-flex items-center gap-1">
              <FaStore /> Vendor
            </span>
          </a>
          <a href="/wishlist" title="favorites" className="hover:scale-125 transition-transform duration-200">
            <FaHeart />
          </a>
          <a href="/cart" title="cart" className="hover:scale-125 transition-transform duration-200">
            <FaShoppingCart />
          </a>
        </div>

        {/* Social Media Links */}
        <div className="hidden md:flex space-x-4 ">
          <a href="https://facebook.com" title="Facebook" target="_blank" className="hover:scale-125 transition-transform duration-200">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" title="Twitter" target="_blank" className="hover:scale-125 transition-transform duration-200">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" title="Instagram" target="_blank" className="hover:scale-125 transition-transform duration-200">
            <FaInstagram />
          </a>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="md:flex items-center justify-between px-6 py-2 border-t border-white hidden ">
        <ul className="flex space-x-6 p-2">
          <li>
            <a href="/deals" className="hover:underline" title="View Offers">
              <span className="inline-flex items-center gap-1">
                Hot Deals <FaBolt className="text-yellow-400" />
              </span>
            </a>
          </li>
          <li className="relative group">
            <button className="hover:underline" title="View Categories">
              <span className="inline-flex items-center gap-1">
                Categories <FaChevronDown />
              </span>
            </button>
            <ul className="absolute left-0 mt-2 w-40 rounded-md bg-orange-200 text-black shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <li>
                <a href="/electronics" className="block px-4 py-2 hover:bg-black hover:text-white">Electronics</a>
              </li>
              <li>
                <a href="/fashion" className="block px-4 py-2 hover:bg-black hover:text-white">Fashion</a>
              </li>
              <li>
                <a href="/home-kitchen" className="block px-4 py-2 hover:bg-black hover:text-white">Home & Kitchen</a>
              </li>
              <li>
                <a href="/beauty" className="block px-4 py-2 hover:bg-black hover:text-white">Beauty</a>
              </li>
            </ul>
          </li>
          <li>
            <a href="/vendors" className="hover:underline" title="See Vendors List">Find Vendors</a>
          </li>
          <li>
            <a href="/auth/register/merchant" className="bg-black text-white px-4 py-1 rounded-full hover:bg-white hover:text-black text-sm" title="Become a Vendor" style={{ fontSize: "13px" }}>
              Sell on Nairobi Verified
            </a>
          </li>
        </ul>

        <ul className="flex space-x-6">
          <li>
            <a href="/contact" className="hover:underline" title="Call Us">
              <span className="inline-flex items-center gap-1">
                <FaPhone /> Contact Us
              </span>
            </a>
          </li>
          <li>
            <a href="/orders" className="hover:underline" title="Orders">Track Order</a>
          </li>
          <li>
            <a href="/" className="hover:scale-125 transition-transform duration-200" title="Tiktok">
              <FaTiktok />
            </a>
          </li>
        </ul>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex md:hidden justify-between items-center px-6 py-2 border-t border-white">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white focus:outline-none text-xl"
          title="Menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="px-6 py-4 bg-[#EC5C0B] md:hidden space-y-4">
          <a href="/deals" className="block hover:underline">Hot Deals</a>
          <div>
            <span className="font-bold block mb-2">Categories</span>
            <a href="/electronics" className="block pl-4 py-1 hover:underline">Electronics</a>
            <a href="/fashion" className="block pl-4 py-1 hover:underline">Fashion</a>
            <a href="/home-kitchen" className="block pl-4 py-1 hover:underline">Home & Kitchen</a>
            <a href="/beauty" className="block pl-4 py-1 hover:underline">Beauty</a>
          </div>
          <a href="/vendors" className="block hover:underline">Find Vendors</a>
          <a href="/auth/register/merchant" className="block bg-black text-white px-4 py-2 rounded-full text-center">Sell on Nairobi Verified</a>
          <div className="pt-2 border-t border-white mt-2">
            <a href="/contact" className="block hover:underline">
              <span className="inline-flex items-center gap-1">
                <FaPhone /> Contact Us
              </span>
            </a>
            <a href="/orders" className="block hover:underline">Track Order</a>
            <a href="#" className="block hover:scale-110">
              <span className="inline-flex items-center gap-1 hover:scale-125 transition-transform duration-200">
                <FaTiktok /> Tiktok
              </span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
