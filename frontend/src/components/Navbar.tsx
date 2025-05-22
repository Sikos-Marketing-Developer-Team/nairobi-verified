import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  FaSearch,
  FaUser,
  FaSignInAlt,
} from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className={`navbar sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-md'}`}>
      {/* Top Row - Logo, Search, Icons */}
      <div className="top-row flex items-center justify-between px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
        {/* Nairobi Verified Logo */}
        <div>
          <Link href="/">
            <Image
              src="/images/logo.webp"
              alt="Nairobi Verified"
              width={130}
              height={70}
              title="home"
              loading="eager"
              style={{ objectFit: "contain" }}
              className="hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        {/* 🔍 Search Bar (Centered) */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white rounded-full px-4 py-2 w-1/2 max-w-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ transition: "all 0.3s ease", minWidth: "300px" }}>
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search items, products, shops ..."
            className="ml-2 flex-grow outline-none text-gray-700 placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-orange-600 text-white px-4 py-1 rounded-full hover:bg-orange-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* User Options */}
        <div className="flex items-center space-x-4">
          <Link href="/auth/login" title="Sign In" className="hover:bg-white hover:text-orange-600 transition-colors text-white font-semibold flex items-center gap-1 bg-black bg-opacity-20 px-3 py-1.5 rounded-full">
            <FaSignInAlt /> <span>Sign In</span>
          </Link>
          <Link href="/wishlist" title="Wishlist" className="hover:scale-110 transition-transform duration-200 text-white text-xl bg-black bg-opacity-20 p-2 rounded-full">
            <FaHeart />
          </Link>
          <Link href="/cart" title="Cart" className="hover:scale-110 transition-transform duration-200 text-white text-xl bg-black bg-opacity-20 p-2 rounded-full">
            <FaShoppingCart />
          </Link>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="md:flex items-center justify-between px-6 py-2 border-t border-white/20 hidden bg-gradient-to-r from-orange-700 to-orange-600 text-white">
        <ul className="flex space-x-6 p-2">
          <li>
            <Link href="/search?category=flash-sale" className="hover:text-yellow-200 transition-colors font-semibold" title="View Offers">
              <span className="inline-flex items-center gap-1">
                Hot Deals <FaBolt className="text-yellow-300" />
              </span>
            </Link>
          </li>
          <li className="relative group">
            <button className="hover:text-yellow-200 transition-colors font-semibold" title="View Categories">
              <span className="inline-flex items-center gap-1">
                Categories <FaChevronDown className="text-sm" />
              </span>
            </button>
            <ul className="absolute left-0 mt-2 w-48 rounded-md bg-white text-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
              <li>
                <Link href="/search?category=1" className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors">Electronics</Link>
              </li>
              <li>
                <Link href="/search?category=2" className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors">Fashion</Link>
              </li>
              <li>
                <Link href="/search?category=3" className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors">Home & Kitchen</Link>
              </li>
              <li>
                <Link href="/search?category=4" className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors">Beauty</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/search?type=vendor" className="hover:text-yellow-200 transition-colors font-semibold" title="See Vendors List">Find Vendors</Link>
          </li>
          <li>
            <Link href="/auth/register/merchant" className="bg-white text-orange-600 px-4 py-1.5 rounded-full hover:bg-orange-100 transition-colors font-semibold" title="Become a Vendor">
              Sell on Nairobi Verified
            </Link>
          </li>
        </ul>

        <ul className="flex space-x-6">
          <li>
            <Link href="/contact" className="hover:text-yellow-200 transition-colors font-semibold" title="Call Us">
              <span className="inline-flex items-center gap-1">
                <FaPhone /> Contact Us
              </span>
            </Link>
          </li>
          <li>
            <Link href="/orders" className="hover:text-yellow-200 transition-colors font-semibold" title="Orders">Track Order</Link>
          </li>
          <li className="flex space-x-2">
            <Link href="https://facebook.com" title="Facebook" target="_blank" className="hover:scale-110 transition-transform duration-200 text-white text-sm bg-black bg-opacity-20 p-1.5 rounded-full">
              <FaFacebook />
            </Link>
            <Link href="https://twitter.com" title="Twitter" target="_blank" className="hover:scale-110 transition-transform duration-200 text-white text-sm bg-black bg-opacity-20 p-1.5 rounded-full">
              <FaTwitter />
            </Link>
            <Link href="https://instagram.com" title="Instagram" target="_blank" className="hover:scale-110 transition-transform duration-200 text-white text-sm bg-black bg-opacity-20 p-1.5 rounded-full">
              <FaInstagram />
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex md:hidden justify-between items-center px-6 py-2 border-t border-white/20 bg-gradient-to-r from-orange-700 to-orange-600 text-white">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white focus:outline-none text-xl bg-black bg-opacity-20 p-2 rounded-md"
          title="Menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="flex-grow mx-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 px-4 pl-10 rounded-full text-gray-700 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </form>
        
        <Link href="/cart" title="Cart" className="text-white text-xl">
          <FaShoppingCart />
        </Link>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="px-6 py-4 bg-white md:hidden space-y-4 text-gray-800 font-medium shadow-lg">
          <Link href="/search?category=flash-sale" className="block hover:text-orange-600 transition-colors flex items-center gap-1">
            Hot Deals <FaBolt className="text-orange-500" />
          </Link>
          <div>
            <span className="font-bold block mb-2 text-gray-900">Categories</span>
            <Link href="/search?category=1" className="block pl-4 py-1.5 hover:text-orange-600 transition-colors">Electronics</Link>
            <Link href="/search?category=2" className="block pl-4 py-1.5 hover:text-orange-600 transition-colors">Fashion</Link>
            <Link href="/search?category=3" className="block pl-4 py-1.5 hover:text-orange-600 transition-colors">Home & Kitchen</Link>
            <Link href="/search?category=4" className="block pl-4 py-1.5 hover:text-orange-600 transition-colors">Beauty</Link>
          </div>
          <Link href="/search?type=vendor" className="block hover:text-orange-600 transition-colors">Find Vendors</Link>
          <Link href="/auth/register/merchant" className="block bg-orange-600 text-white px-4 py-2 rounded-full text-center font-semibold hover:bg-orange-700 transition-colors">Sell on Nairobi Verified</Link>
          <div className="pt-2 border-t border-gray-200 mt-2">
            <Link href="/auth/login" className="block hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1">
              <FaSignInAlt /> Sign In
            </Link>
            <Link href="/wishlist" className="block hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1">
              <FaHeart /> Wishlist
            </Link>
            <Link href="/contact" className="block hover:text-orange-600 transition-colors py-1.5 flex items-center gap-1">
              <FaPhone /> Contact Us
            </Link>
            <Link href="/orders" className="block hover:text-orange-600 transition-colors py-1.5">Track Order</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
