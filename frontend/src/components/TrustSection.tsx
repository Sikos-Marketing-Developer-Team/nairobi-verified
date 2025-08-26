
import React from 'react';
import { Shield, MapPin, Star, Users } from 'lucide-react';
import {Link} from 'react-router-dom';
import nairobiImg from "@/images/nairobi.png";

const features = [
  {
    icon: Shield,
    title: 'Verified Merchants Only',
    description: 'Every merchant undergoes thorough verification including business registration and physical location confirmation.',
    stats: '100% Verified'
  },
  {
    icon: MapPin,
    title: 'Physical Store Locations',
    description: 'Visit actual stores in Nairobi CBD. Get directions and see the business in person before you buy.',
    stats: '200+ Locations'
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description: 'All products are quality checked by our merchants. Return policy and buyer protection included.',
    stats: '4.8/5 Rating'
  },
  {
    icon: Users,
    title: 'Trusted Community',
    description: 'Join thousands of satisfied customers who shop with confidence on Nairobi Verified.',
    stats: '10,000+ Users'
  }
];

const TrustSection = () => {
  return (
    <section className="py-16 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
            Why Choose Nairobi Verified?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We bridge the gap between online shopping and physical retail, 
            ensuring you can trust every purchase you make.
          </p>
        </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {features.map((feature, index) => (
    <div
      key={index}
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        border: '1px solid #FEEFD4'
      }}
      className="flex flex-col justify-between text-center bg-white transition-all duration-300 ease-in-out transform hover:scale-105 p-6 rounded-xl h-full"
    >
      <div>
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
          <feature.icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {feature.description}
        </p>
      </div>
      <div className="text-2xl font-bold text-primary mt-auto">
        {feature.stats}
      </div>
    </div>
  ))}
</div>

<div className="flex justify-center">
  <button>
    <Link
      to="/howitworks"
      className="mt-12 inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
    >
      Sell with Us
    </Link>
  </button>
</div>




        {/* Call to Action */}
  <div className="relative mt-16 rounded-2xl overflow-hidden">
  {/* Background Image */}
  <img
    src={nairobiImg}
    alt="Nairobi"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Black glass overlay */}
  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

  {/* Content */}
  <div className="relative p-8 lg:p-12 text-center text-white">
    <h3 className="text-2xl lg:text-3xl font-bold inter mb-4">
      Ready to Start Shopping Safely?
    </h3>
    <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
      Join thousands of satisfied customers who trust Nairobi Verified for their online shopping needs.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link to="/auth/register">
        <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Create Account
        </button>
      </Link>
      <Link to="/merchants">
        <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
          Browse Products
        </button>
      </Link>
    </div>
  </div>
</div>





      </div>
    </section>
  );
};

export default TrustSection;
