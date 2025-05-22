import { useState, FormEvent } from "react";
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
  FaTiktok,
  FaSearch,
  FaUser,
} from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar bg-[#EC5C0B] text-white shadow-md font-medium">
      {/* Top Row - Logo, Search, Icons */}
      <div className="top-row flex items-center justify-between px-6 py-3">
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
            />
          </Link>
        </div>

        {/* 🔍 Search Bar (Centered) */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white rounded-full px-4 py-2 w-1/2 max-w-lg overflow-hidden" style={{ transition: "width 0.3s ease", minWidth: "300px" }}>
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search items, products, shops ..."
            className="ml-2 flex-grow outline-none text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-[#000000] text-white px-4 py-1 rounded-full hover:bg-[#EC5C0B]"
          >
            Search
          </button>
        </form>

        {/* User Options */}
        <div className="flex items-center space-x-6">
          <Link href="/auth/register/client" title="client account" className="hover:underline text-white font-semibold flex items-center gap-1 bg-black bg-opacity-20 px-3 py-1 rounded-full">
            <FaUser /> <span className="text-white">Buyer</span>
          </Link>
          <Link href="/auth/register/merchant" title="merchant account" className="hover:underline text-white font-semibold flex items-center gap-1 bg-black bg-opacity-20 px-3 py-1 rounded-full">
            <FaStore /> <span className="text-white">Vendor</span>
          </Link>
          <Link href="/wishlist" title="favorites" className="hover:scale-125 transition-transform duration-200 text-white text-xl">
            <FaHeart />
          </Link>
          <Link href="/cart" title="cart" className="hover:scale-125 transition-transform duration-200 text-white text-xl">
            <FaShoppingCart />
          </Link>
        </div>

        {/* Social Media Links */}
        <div className="hidden md:flex space-x-4">
          <Link href="https://facebook.com" title="Facebook" target="_blank" className="hover:scale-125 transition-transform duration-200 text-white text-xl bg-black bg-opacity-20 p-2 rounded-full">
            <FaFacebook />
          </Link>
          <Link href="https://twitter.com" title="Twitter" target="_blank" className="hover:scale-125 transition-transform duration-200 text-white text-xl bg-black bg-opacity-20 p-2 rounded-full">
            <FaTwitter />
          </Link>
          <Link href="https://instagram.com" title="Instagram" target="_blank" className="hover:scale-125 transition-transform duration-200 text-white text-xl bg-black bg-opacity-20 p-2 rounded-full">
            <FaInstagram />
          </Link>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="md:flex items-center justify-between px-6 py-2 border-t border-white hidden bg-black bg-opacity-10">
        <ul className="flex space-x-6 p-2">
          <li>
            <Link href="/search?category=flash-sale" className="hover:underline font-semibold text-white" title="View Offers">
              <span className="inline-flex items-center gap-1">
                Hot Deals <FaBolt className="text-yellow-400" />
              </span>
            </Link>
          </li>
          <li className="relative group">
            <button className="hover:underline font-semibold text-white" title="View Categories">
              <span className="inline-flex items-center gap-1">
                Categories <FaChevronDown />
              </span>
            </button>
            <ul className="absolute left-0 mt-2 w-40 rounded-md bg-white text-black shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <li>
                <Link href="/search?category=1" className="block px-4 py-2 hover:bg-black hover:text-white">Electronics</Link>
              </li>
              <li>
                <Link href="/search?category=2" className="block px-4 py-2 hover:bg-black hover:text-white">Fashion</Link>
              </li>
              <li>
                <Link href="/search?category=3" className="block px-4 py-2 hover:bg-black hover:text-white">Home & Kitchen</Link>
              </li>
              <li>
                <Link href="/search?category=4" className="block px-4 py-2 hover:bg-black hover:text-white">Beauty</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/search?type=vendor" className="hover:underline font-semibold text-white" title="See Vendors List">Find Vendors</Link>
          </li>
          <li>
            <Link href="/auth/register/merchant" className="bg-black text-white px-4 py-1 rounded-full hover:bg-white hover:text-black font-semibold" title="Become a Vendor">
              Sell on Nairobi Verified
            </Link>
          </li>
        </ul>

        <ul className="flex space-x-6">
          <li>
            <Link href="/contact" className="hover:underline font-semibold text-white" title="Call Us">
              <span className="inline-flex items-center gap-1">
                <FaPhone /> Contact Us
              </span>
            </Link>
          </li>
          <li>
            <Link href="/orders" className="hover:underline font-semibold text-white" title="Orders">Track Order</Link>
          </li>
          <li>
            <Link href="/" className="hover:scale-125 transition-transform duration-200 text-white" title="Kenya">
              &#x1F1F0;&#x1F1EA;
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex md:hidden justify-between items-center px-6 py-2 border-t border-white bg-black bg-opacity-10">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white focus:outline-none text-xl bg-black bg-opacity-20 p-2 rounded-md"
          title="Menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="px-6 py-4 bg-[#EC5C0B] md:hidden space-y-4 text-white font-medium">
          <Link href="/search?category=flash-sale" className="block hover:underline flex items-center gap-1 text-white">
            Hot Deals <FaBolt className="text-yellow-400" />
          </Link>
          <div>
            <span className="font-bold block mb-2 text-white">Categories</span>
            <Link href="/search?category=1" className="block pl-4 py-1 hover:underline text-white">Electronics</Link>
            <Link href="/search?category=2" className="block pl-4 py-1 hover:underline text-white">Fashion</Link>
            <Link href="/search?category=3" className="block pl-4 py-1 hover:underline text-white">Home & Kitchen</Link>
            <Link href="/search?category=4" className="block pl-4 py-1 hover:underline text-white">Beauty</Link>
          </div>
          <Link href="/search?type=vendor" className="block hover:underline text-white">Find Vendors</Link>
          <Link href="/auth/register/merchant" className="block bg-black text-white px-4 py-2 rounded-full text-center font-semibold">Sell on Nairobi Verified</Link>
          <div className="pt-2 border-t border-white mt-2">
            <Link href="/contact" className="block hover:underline text-white py-1">
              <span className="inline-flex items-center gap-1">
                <FaPhone /> Contact Us
              </span>
            </Link>
            <Link href="/orders" className="block hover:underline text-white py-1">Track Order</Link>
            <Link href="/" className="block hover:scale-110 text-white py-1">
              <span className="inline-flex items-center gap-1 hover:scale-125 transition-transform duration-200">
                Kenya &#x1F1F0;&#x1F1EA;
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
