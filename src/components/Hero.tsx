import React from 'react';
import { ArrowRight, CheckCircle, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 to-yellow-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-gray-700 font-medium">Verified Businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Physical Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700 font-medium">Trusted Community</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/merchants">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white">
                  Find Merchants
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth/register/merchant">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white">
                  Register Your Business
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&q=80"
                alt="Nairobi CBD marketplace"
                className="w-full h-full object-cover rounded-2xl shadow-xl"
              />
            </div>
            
            {/* Floating verification badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
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
