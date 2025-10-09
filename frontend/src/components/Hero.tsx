import React, { useState } from 'react';
import { ArrowRight, CheckCircle, MapPin, Users, Search, Filter, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedLocation !== 'all') params.append('location', selectedLocation);
    
    navigate(`/merchants?${params.toString()}`);
    setIsSearchOpen(false);
  };

  return (
    <section className="relative bg-gradient-to-br from-orange-50 to-yellow-50 pt-40 sm:pt-48 pb-12 sm:pb-16 lg:pt-44 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-3 lg:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold inter text-gray-900 leading-tight">
                Discover
                <span className="text-primary block">Verified Merchants</span>
                in Nairobi CBD
              </h1>
              <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
                Shop with confidence at physically verified businesses. Every merchant on our platform has a real location you can visit in Nairobi's Central Business District.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-3 sm:gap-6">
              <div className="flex items-center gap-2 p-2 rounded border-l-2 border-l-[#16A34A] shadow-sm bg-white">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">Verified Businesses</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border-l-2 border-l-[#2563EB] shadow-sm bg-white">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">Physical Locations</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border-l-2 border-l-[#9333EA] shadow-sm bg-white">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">Trusted Community</span>
              </div>
            </div>

            {/* CTA Buttons */}
           {/* CTA Buttons */}
<div className="flex flex-row gap-3 sm:flex-col sm:gap-4 lg:flex-row lg:gap-4">
  <Link
    to="/merchants"
    className={`${
      isAuthenticated ? "w-full" : "flex-1 sm:flex-none"
    }`}
  >
    <Button
      size={window.innerWidth < 1024 ? "sm" : "lg"}
      className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white rounded-[5px] lg:px-6 lg:py-3"
    >
      Find Merchants
      <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
    </Button>
  </Link>

  {!isAuthenticated && (
    <Link to="/auth" className="flex-1 sm:flex-none">
      <Button
        variant="outline"
        size={window.innerWidth < 1024 ? "sm" : "lg"}
        className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-[5px] lg:px-6 lg:py-3"
      >
        Create Account
      </Button>
    </Link>
  )}
</div>

          </div>

          {/* Search Feature - Modal on mobile, inline on desktop */}
          <div className={`lg:relative ${isSearchOpen ? 'fixed inset-0 z-50 flex items-center justify-center lg:static' : 'hidden lg:block'}`}>
            {/* Overlay for mobile modal */}
            {isSearchOpen && (
              <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}></div>
            )}
            <div className={`relative w-full max-w-md mx-4 lg:max-w-none lg:mx-0 scale-95 sm:scale-90 lg:scale-100 origin-center -ml-1 sm:-ml-2 lg:ml-0 ${isSearchOpen ? 'animate-slide-up lg:animate-none' : ''}`}>
              <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-[#F97316] relative">
                {/* Cancel Button for Mobile */}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                  aria-label="Close search modal"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-xl sm:text-2xl">Find What You Need</h3>
                    <p className="text-gray-600 text-sm">Search verified merchants in your area</p>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mb-4 sm:mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for products, vendors, or categories..."
                    className="w-full py-3 sm:py-4 px-4 sm:px-6 pl-10 sm:pl-14 border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-gradient-to-br from-orange-100/80 to-[#EC5C0A]/20 backdrop-blur-lg transition-all duration-300"
                  />
                  <Search className="absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                {/* Filter Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full py-3 px-4 pr-8 sm:pr-10 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-white/60 backdrop-blur-lg appearance-none cursor-pointer transition-all duration-300"
                    >
                      <option value="all">All Categories</option>
                      <option value="electronics">Electronics</option>
                      <option value="fashion">Fashion & Clothing</option>
                      <option value="home">Home & Living</option>
                      <option value="beauty">Beauty & Health</option>
                      <option value="food">Food & Beverages</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full py-3 px-4 pr-8 sm:pr-10 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-white/60 backdrop-blur-lg appearance-none cursor-pointer transition-all duration-300"
                    >
                      <option value="all">All CBD Areas</option>
                      <option value="cbd-central">Central CBD</option>
                      <option value="river-road">River Road</option>
                      <option value="tom-mboya">Tom Mboya Street</option>
                      <option value="moi-avenue">Moi Avenue</option>
                      <option value="kenyatta-avenue">Kenyatta Avenue</option>
                    </select>
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>

                {/* Popular Searches */}
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular searches:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Phones', 'Fashion', 'Electronics', 'Beauty'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          setTimeout(() => handleSearch(), 100);
                        }}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-[5px] text-sm hover:bg-orange-200 transition-colors duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-[#EC5C0A] to-[#FB923C] text-white py-3 sm:py-4 rounded-[5px] hover:from-orange-700 hover:to-yellow-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                >
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  Search Verified Merchants
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>

                {/* Quick Actions */}
                <div className="flex gap-2 sm:grid sm:grid-cols-2 sm:gap-3 mt-4 sm:mt-6">
                  <button className="flex-1 sm:flex-none py-2 sm:py-3 px-3 sm:px-4 bg-[#FDEDD5] hover:bg-[#FEF9EA] text-gray rounded-[5px] transition-colors duration-200 text-sm font-medium border border-[#F97316]/20">
                    Browse All Merchants
                  </button>
                  <Link to="/auth/register/merchant" className="flex-1 sm:flex-none">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white rounded-[5px] text-sm sm:text-base">
                      Register Your Business
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Floating Elements - Hidden in mobile modal */}
              <div className="lg:absolute -top-10 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse hidden lg:block"></div>
              <div className="lg:absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-200 to-[#22C55E] rounded-full opacity-30 animate-bounce hidden lg:block"></div>
              <div className="lg:absolute -bottom-10 sm:-bottom-14 -left-3 sm:-left-5 bg-white rounded-2xl shadow-lg p-3 sm:p-4 border-l-4 border-l-green-500 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-gray-900">100+ Verified</p>
                    <p className="text-sm text-gray-600">Merchants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Icon Button for Mobile */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="lg:hidden fixed bottom-4 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors duration-200 z-50"
            aria-label="Open search modal"
          >
            <Search className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;