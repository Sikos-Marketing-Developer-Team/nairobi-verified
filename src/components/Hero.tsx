import React, { useState } from 'react';
import { ArrowRight, CheckCircle, MapPin, Users, Search, Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const handleSearch = () => {
    console.log({ searchQuery, selectedCategory, selectedLocation });
  };

 return (
    <section className="relative bg-gradient-to-br from-orange-50 to-yellow-50 pt-48 pb-16 sm:pt-40 lg:pt-44 lg:pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold inter text-gray-900 leading-tight">
                Discover
                <span className="text-primary block">Verified Merchants</span>
                in Nairobi CBD
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Shop with confidence at physically verified businesses. Every merchant on our platform has a real location you can visit in Nairobi's Central Business District.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 p-2 rounded border-l-2 border-l-[#16A34A] shadow-sm bg-white">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-gray-700 font-medium">Verified Businesses</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border-l-2 border-l-[#2563EB] shadow-sm bg-white">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Physical Locations</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border-l-2 border-l-[#9333EA] shadow-sm bg-white">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700 font-medium">Trusted Community</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/merchants">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white rounded-[5px]">
                  Find Merchants
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-[5px]">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Feature */}
          <div className="relative scale-90 origin-center -ml-2">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-[#F97316]">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-2xl">Find What You Need</h3>
                  <p className="text-gray-600 text-sm">Search verified merchants in your area</p>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, vendors, or categories..."
                  className="w-full py-4 px-6 pl-14 border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-gradient-to-br from-orange-100/80 to-[#EC5C0A]/20 backdrop-blur-lg transition-all duration-300"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-3 px-4 pr-10 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-white/60 backdrop-blur-lg appearance-none cursor-pointer transition-all duration-300"
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
                    className="w-full py-3 px-4 pr-10 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-gray-700 bg-white/60 backdrop-blur-lg appearance-none cursor-pointer transition-all duration-300"
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
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular searches:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Phones', 'Fashion', 'Electronics', 'Beauty'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
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
                className="w-full bg-gradient-to-r from-[#EC5C0A] to-[#FB923C] text-white py-4 rounded-[5px] hover:from-orange-700 hover:to-yellow-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
              >
                <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Search Verified Merchants
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button className="py-3 px-4 bg-[#FDEDD5] hover:bg-[#FEF9EA] text-black rounded-[5px] transition-colors duration-200 text-sm font-medium border border-[#F97316]/20">
                  Browse All Merchants
                </button>
                <Link to="/auth/register/merchant">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white rounded-[5px]">
                    Register Your Business
                  </Button>
                </Link>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-10 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-200 to-[#22C55E] rounded-full opacity-30 animate-bounce"></div>
            {/* Floating verification badge */}
            <div className="absolute -bottom-14 -left-5 bg-white rounded-2xl shadow-lg p-4 border-l-4 border-l-green-500">
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
      </div>
    </section>
  );
};

export default Hero;