import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, MapPin, Users, Search, Filter, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedLocation !== 'all') params.append('location', selectedLocation);
    
    navigate(`/merchants?${params.toString()}`);
    setIsSearchModalOpen(false);
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchModalOpen]);

  return (
    <section className="relative bg-gradient-to-br from-orange-50 to-yellow-50 pt-40 sm:pt-48 pb-12 sm:pb-16 lg:pt-44 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-3 lg:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold inter text-gray-900 leading-tight">
                Discover
                <span className="text-primary block">Verified Merchants</span>
                in Nairobi CBD
              </h1>
              <p className="text-base sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
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

            {/* CTA Buttons - Conditionally rendered based on authentication */}
            {!isAuthenticated ? (
              <div className="flex flex-row gap-3 sm:flex-col sm:gap-4 lg:flex-row lg:gap-4">
                <Link to="/merchants" className="flex-1 sm:flex-none">
                  <Button size={window.innerWidth < 1024 ? "sm" : "lg"} className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white rounded-[5px] lg:px-6 lg:py-3">
                    Find Merchants
                    <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                </Link>
                <Link to="/auth" className="flex-1 sm:flex-none">
                  <Button variant="outline" size={window.innerWidth < 1024 ? "sm" : "lg"} className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-[5px] lg:px-6 lg:py-3">
                    Create Account
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-row gap-3">
                <Link to="/merchants" className="flex-1">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary-dark text-white rounded-[5px] px-6 py-3">
                    Find Merchants
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Side - Clickable Modal Trigger */}
          <div className="flex justify-center lg:justify-end">
            <div 
              onClick={openSearchModal}
              className="w-full max-w-md cursor-pointer group transform hover:scale-105 transition-transform duration-300"
            >
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-[#F97316] border-dashed hover:border-solid hover:border-[#EC5C0A] relative overflow-hidden">
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-2xl">Quick Search</h3>
                    <p className="text-gray-600">Find verified merchants instantly</p>
                  </div>
                </div>

                {/* Search Preview */}
                <div className="space-y-4 relative z-10">
                  <div className="bg-gradient-to-br from-orange-100/80 to-[#EC5C0A]/20 backdrop-blur-lg rounded-2xl p-4 border-2 border-white/50">
                    <div className="flex items-center gap-3">
                      <Search className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">Search for products, vendors...</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-3 border-2 border-gray-100">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 text-sm">All Categories</span>
                      </div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-3 border-2 border-gray-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 text-sm">All CBD Areas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Text */}
                <div className="mt-6 text-center relative z-10">
                  <div className="inline-flex items-center gap-2 bg-[#EC5C0A] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Click to search
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-200 to-[#22C55E] rounded-full opacity-30 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-2 border-[#F97316]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeSearchModal}
              className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-900 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform duration-200"
              aria-label="Close search modal"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-2xl sm:text-3xl">Find What You Need</h3>
                  <p className="text-gray-600">Search verified merchants in Nairobi CBD</p>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for products, vendors, or categories..."
                  className="w-full py-4 px-6 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-white transition-all duration-300 text-lg"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-3 px-4 pr-10 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-white appearance-none cursor-pointer transition-all duration-300"
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
                    className="w-full py-3 px-4 pr-10 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-white appearance-none cursor-pointer transition-all duration-300"
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
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular searches:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Phones', 'Fashion', 'Electronics', 'Beauty', 'Restaurants', 'Supermarkets'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                      }}
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors duration-200 font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-[#EC5C0A] to-[#FB923C] text-white py-4 rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group text-lg"
              >
                <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Search Verified Merchants
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={() => {
                    navigate('/merchants');
                    closeSearchModal();
                  }}
                  className="py-3 px-4 bg-[#FDEDD5] hover:bg-[#FEF9EA] text-gray-700 rounded-lg transition-colors duration-200 font-medium border border-[#F97316]/20 text-center"
                >
                  Browse All Merchants
                </button>
                <Link 
                  to="/auth/register/merchant" 
                  onClick={closeSearchModal}
                  className="block"
                >
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white rounded-lg py-3 text-base">
                    Register Your Business
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;