"use client";
import MainLayout from "@/components/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import LazyLoad from "@/components/LazyLoad";
import { FiMapPin, FiShoppingBag, FiUsers, FiStar, FiShield, FiTruck, FiClock, FiHeart } from "react-icons/fi";
import { FaSearch, FaMapMarkerAlt, FaStore, FaShoppingCart, FaRegCreditCard } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import OptimizedImage from "@/components/OptimizedImage";
import FontLoader from "@/components/FontLoader";

// Dynamically import heavy components
const FeaturedProducts = dynamic(() => import("@/components/FeaturedProducts"), {
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false
});

const FeaturedCategories = dynamic(() => import("@/components/FeaturedCategories"), {
  loading: () => <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false
});

const FeaturedVendors = dynamic(() => import("@/components/FeaturedVendors"), {
  loading: () => <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false
});

export default function Home() {
  return (
    <MainLayout className="overflow-hidden">
      {/* Font optimization */}
      <FontLoader 
        fonts={[
          { family: 'Inter', weights: [400, 500, 600, 700], styles: ['normal'], display: 'swap', preload: true },
          { family: 'Poppins', weights: [600, 700], styles: ['normal'], display: 'swap', preload: true }
        ]} 
      />
      {/* Hero Section with Background Image */}
      <section className="relative bg-gradient-to-r from-orange-600 to-orange-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/nairobi-skyline.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-orange-500/30 animate-pulse z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-shadow">
              Discover Verified Vendors in Nairobi CBD
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white max-w-xl">
              Shop with confidence from trusted local businesses with easy navigation to physical stores.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="bg-white text-orange-600 py-3 px-8 rounded-lg hover:bg-orange-50 transition-all duration-300 font-medium flex items-center justify-center shadow-lg hover:shadow-xl">
                <FiShoppingBag className="mr-2" />
                Shop Now
              </Link>
              <Link href="/auth/register/merchant" className="bg-black bg-opacity-60 text-white border border-white py-3 px-8 rounded-lg hover:bg-black hover:bg-opacity-80 transition-all duration-300 font-medium flex items-center justify-center shadow-lg hover:shadow-xl">
                <FaStore className="mr-2" />
                Become a Vendor
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-gray-800 font-bold text-xl mb-4">Find What You Need</h3>
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Search for products, vendors, or categories..." 
                  className="w-full py-3 px-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <select className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white">
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Living</option>
                  <option value="beauty">Beauty & Health</option>
                </select>
                <select className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 bg-white">
                  <option value="all">All Locations</option>
                  <option value="cbd">CBD</option>
                  <option value="westlands">Westlands</option>
                  <option value="eastleigh">Eastleigh</option>
                  <option value="karen">Karen</option>
                </select>
              </div>
              <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg">
                Search Now
              </button>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-orange-100 p-4 rounded-lg shadow-md hidden md:block transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full p-2 mr-3">
                  <FiStar className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Trusted by</p>
                  <p className="text-orange-600 font-bold">5,000+ Shoppers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z"></path>
          </svg>
        </div>
      </section>

      {/* Trending Categories with Visual Icons */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Trending Categories</h2>
              <p className="text-gray-600 mt-2">Explore our most popular shopping categories</p>
            </div>
            <Link href="/categories" className="text-orange-600 hover:text-orange-700 font-medium flex items-center group">
              <span className="group-hover:mr-1 transition-all duration-300">View All Categories</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <ErrorBoundary>
            <FeaturedCategories 
              title="Trending Categories" 
              subtitle="Explore our most popular shopping categories" 
            />
          </ErrorBoundary>
        </div>
      </section>

      {/* Featured Products with Improved Cards */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
              View All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <ErrorBoundary>
            <FeaturedProducts />
          </ErrorBoundary>
        </div>
      </section>

      {/* Trusted Vendors Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Trusted Vendors</h2>
            <Link href="/vendors" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
              View All Vendors
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <ErrorBoundary>
            <FeaturedVendors />
          </ErrorBoundary>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '24px 24px' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">SIMPLE PROCESS</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Nairobi Verified Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We make it easy to discover, shop, and locate verified vendors in Nairobi CBD.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <FaSearch className="w-8 h-8" />,
                title: "Discover",
                description: "Find verified vendors and quality products in Nairobi CBD.",
                color: "bg-blue-100",
                textColor: "text-blue-600",
                hoverColor: "hover:bg-blue-200",
                number: "01"
              },
              {
                icon: <FaShoppingCart className="w-8 h-8" />,
                title: "Shop",
                description: "Purchase products online with secure payment options.",
                color: "bg-green-100",
                textColor: "text-green-600",
                hoverColor: "hover:bg-green-200",
                number: "02"
              },
              {
                icon: <FaMapMarkerAlt className="w-8 h-8" />,
                title: "Locate",
                description: "Get directions to physical stores for in-person shopping.",
                color: "bg-purple-100",
                textColor: "text-purple-600",
                hoverColor: "hover:bg-purple-200",
                number: "03"
              },
              {
                icon: <FaRegCreditCard className="w-8 h-8" />,
                title: "Pay",
                description: "Multiple payment options including M-Pesa and cards.",
                color: "bg-yellow-100",
                textColor: "text-yellow-600",
                hoverColor: "hover:bg-yellow-200",
                number: "04"
              }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative group hover:-translate-y-2">
                {/* Step number */}
                <div className="absolute -top-4 -right-4 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold text-gray-500 group-hover:text-orange-600 transition-colors">
                  {step.number}
                </div>
                
                {/* Connection arrow */}
                <div className={`absolute top-1/2 -right-4 w-8 h-8 transform -translate-y-1/2 ${index === 3 ? 'hidden' : 'hidden md:block'}`}>
                  <svg className="w-full h-full text-orange-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 12h14m-7-7l7 7-7 7"></path>
                  </svg>
                </div>
                
                <div className={`inline-flex items-center justify-center w-16 h-16 ${step.color} ${step.textColor} rounded-full mb-6 group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 transition-colors">{step.title}</h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
                
                {/* Hover indicator */}
                <div className="w-0 h-1 bg-orange-500 group-hover:w-full transition-all duration-300 mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with Icons */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Nairobi Verified?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We are more than just an online marketplace - we connect you with verified local businesses in Nairobi.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-6">
                <FiShield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Vendors</h3>
              <p className="text-gray-600 mb-4">
                All vendors on our platform are verified to ensure you are dealing with legitimate businesses.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Background checks</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Physical store verification</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Customer reviews</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-6">
                <FiTruck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Products</h3>
              <p className="text-gray-600 mb-4">
                Browse a wide selection of quality products from trusted local vendors.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Quality assurance</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Authentic products</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Competitive pricing</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-6">
                <FiMapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Location Guidance</h3>
              <p className="text-gray-600 mb-4">
                Get directions to physical stores in Nairobi CBD, making it easy to find what you need.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Interactive maps</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Turn-by-turn directions</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Store hours & details</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Map Feature Section */}
      <section className="py-20 px-4 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-500 opacity-5 transform rotate-12 translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore Nairobi CBD with Ease</h2>
              <p className="text-lg mb-6 text-gray-700">
                Nairobi Verified doesn't just help you shop — it helps you get there too. Find vendor locations and navigate the busy CBD like a pro!
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-4">
                    <FiMapPin className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Interactive Maps</h4>
                    <p className="text-gray-600">See all vendor locations on an easy-to-use map interface.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-4">
                    <FiClock className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Real-time Updates</h4>
                    <p className="text-gray-600">Get current information on store hours and availability.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-4">
                    <FiHeart className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Save Favorites</h4>
                    <p className="text-gray-600">Bookmark your favorite shops for quick access later.</p>
                  </div>
                </div>
              </div>
              
              <Link href="/map" className="inline-flex items-center bg-orange-600 text-white py-3 px-8 rounded-lg hover:bg-orange-700 transition-colors duration-300 font-medium">
                <FaMapMarkerAlt className="mr-2" />
                View Shop Locations
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-white p-4 rounded-xl shadow-xl">
                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-200">
                  <div className="w-full h-full relative">
                    {/* This would be a map image or component */}
                    <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                      <p className="text-gray-600 font-medium">Interactive Map</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-md hidden md:block">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-2 mr-3">
                    <FiMapPin className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Find shops</p>
                    <p className="text-green-600 font-bold">within minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Hear from shoppers and vendors who have experienced the Nairobi Verified difference.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sally Mugisha",
                role: "Shopper",
                image: "/images/testimonial1.jpg",
                quote: "Nairobi Verified has made shopping in CBD so much easier. I can find exactly what I need and know exactly where to go!"
              },
              {
                name: "Joseph Mwangi",
                role: "Vendor",
                image: "/images/testimonial2.jpg",
                quote: "Since joining Nairobi Verified, my customer base has grown significantly. The platform brings serious buyers to my shop."
              },
              {
                name: "Jude Kimathi",
                role: "Shopper",
                image: "/images/testimonial3.jpg",
                quote: "I love that I can browse products online and then visit the physical store. It saves me so much time and hassle."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-orange-200 text-orange-800 font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Whether you're a buyer looking for quality products or a vendor wanting to reach more customers, Nairobi Verified is the right place for you!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/auth/register/client" className="bg-white text-orange-600 py-4 px-10 rounded-lg hover:bg-orange-50 transition-colors duration-300 font-medium text-lg">
              Sign Up as Buyer
            </Link>
            <Link href="/auth/register/merchant" className="bg-black bg-opacity-30 text-white border border-white py-4 px-10 rounded-lg hover:bg-black hover:bg-opacity-40 transition-colors duration-300 font-medium text-lg">
              Sign Up as Vendor
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
