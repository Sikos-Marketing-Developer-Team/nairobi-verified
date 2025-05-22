"use client";
import MainLayout from "@/components/MainLayout";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedCategories from "@/components/FeaturedCategories";
import FeaturedVendors from "@/components/FeaturedVendors";
import { FiMapPin, FiShoppingBag, FiUsers, FiStar, FiShield, FiTruck, FiClock, FiHeart } from "react-icons/fi";
import { FaSearch, FaMapMarkerAlt, FaStore, FaShoppingCart, FaRegCreditCard } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <MainLayout className="overflow-hidden">
      {/* Hero Section with Background Image */}
      <section className="relative bg-gradient-to-r from-orange-600 to-orange-400 text-white">
        <div className="absolute inset-0 bg-black opacity-40 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/nairobi-skyline.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover Verified Vendors in Nairobi CBD
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-xl">
              Shop with confidence from trusted local businesses with easy navigation to physical stores.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register/client" className="bg-white text-orange-600 py-3 px-8 rounded-lg hover:bg-orange-50 transition-colors duration-300 font-medium flex items-center justify-center">
                <FiShoppingBag className="mr-2" />
                Shop Now
              </Link>
              <Link href="/auth/register/merchant" className="bg-black bg-opacity-60 text-white border border-white py-3 px-8 rounded-lg hover:bg-black hover:bg-opacity-80 transition-colors duration-300 font-medium flex items-center justify-center">
                <FaStore className="mr-2" />
                Become a Vendor
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h3 className="text-gray-800 font-bold text-xl mb-4">Find What You Need</h3>
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Search for products, vendors, or categories..." 
                  className="w-full py-3 px-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <select className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Living</option>
                  <option value="beauty">Beauty & Health</option>
                </select>
                <select className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">All Locations</option>
                  <option value="cbd">CBD</option>
                  <option value="westlands">Westlands</option>
                  <option value="eastleigh">Eastleigh</option>
                  <option value="karen">Karen</option>
                </select>
              </div>
              <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors duration-300 font-medium">
                Search Now
              </button>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-orange-100 p-4 rounded-lg shadow-md hidden md:block">
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
            <h2 className="text-3xl font-bold text-gray-900">Trending Categories</h2>
            <Link href="/categories" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
              View All Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "Electronics", icon: "/icons/electronics.png", color: "bg-blue-100" },
              { name: "Fashion", icon: "/icons/fashion.png", color: "bg-pink-100" },
              { name: "Home & Living", icon: "/icons/home.png", color: "bg-green-100" },
              { name: "Beauty", icon: "/icons/beauty.png", color: "bg-purple-100" },
              { name: "Sports", icon: "/icons/sports.png", color: "bg-yellow-100" },
              { name: "Phones", icon: "/icons/phones.png", color: "bg-red-100" },
            ].map((category, index) => (
              <Link href={`/categories/${category.name.toLowerCase()}`} key={index} className="group">
                <div className={`${category.color} rounded-xl p-6 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                  <div className="w-16 h-16 mb-4 relative">
                    <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="w-full h-full flex items-center justify-center">
                      {/* Fallback to a div if image doesn't exist */}
                      <div className="text-3xl text-gray-800 font-bold">{category.name.charAt(0)}</div>
                    </div>
                  </div>
                  <h3 className="text-gray-800 font-medium text-center">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
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
          
          <FeaturedProducts />
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
          
          <FeaturedVendors />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Nairobi Verified Works</h2>
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
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: <FaShoppingCart className="w-8 h-8" />,
                title: "Shop",
                description: "Purchase products online with secure payment options.",
                color: "bg-green-100 text-green-600"
              },
              {
                icon: <FaMapMarkerAlt className="w-8 h-8" />,
                title: "Locate",
                description: "Get directions to physical stores for in-person shopping.",
                color: "bg-purple-100 text-purple-600"
              },
              {
                icon: <FaRegCreditCard className="w-8 h-8" />,
                title: "Pay",
                description: "Multiple payment options including M-Pesa and cards.",
                color: "bg-yellow-100 text-yellow-600"
              }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
                <div className={`absolute top-0 right-0 w-24 h-24 ${index === 3 ? 'hidden' : 'block'}`}>
                  <svg className="w-full h-full text-gray-100" fill="currentColor" viewBox="0 0 100 100">
                    <path d="M95,50 L75,30 L75,45 L25,45 L25,55 L75,55 L75,70 L95,50 Z"></path>
                  </svg>
                </div>
                <div className={`inline-flex items-center justify-center w-16 h-16 ${step.color} rounded-full mb-6`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
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
                name: "Jane Muthoni",
                role: "Shopper",
                image: "/images/testimonial1.jpg",
                quote: "Nairobi Verified has made shopping in CBD so much easier. I can find exactly what I need and know exactly where to go!"
              },
              {
                name: "David Ochieng",
                role: "Vendor",
                image: "/images/testimonial2.jpg",
                quote: "Since joining Nairobi Verified, my customer base has grown significantly. The platform brings serious buyers to my shop."
              },
              {
                name: "Sarah Kimani",
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
