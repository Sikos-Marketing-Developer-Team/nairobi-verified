"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingBag, FiStore, FiCheck, FiArrowRight } from 'react-icons/fi';
import MainLayout from '@/components/MainLayout';

export default function JoinPage() {
  const buyerBenefits = [
    'Access to verified vendors in Nairobi CBD',
    'Secure shopping experience with trusted sellers',
    'Easy navigation to physical store locations',
    'Exclusive deals and promotions',
    'Customer protection policies',
    'Convenient order tracking'
  ];

  const vendorBenefits = [
    'Increase your visibility to potential customers',
    'Build trust with the verified badge',
    'Manage your online storefront easily',
    'Access to marketing tools and analytics',
    'Secure payment processing',
    'Dedicated seller support'
  ];

  const testimonials = [
    {
      id: 1,
      type: 'buyer',
      name: 'Sarah M.',
      quote: 'Nairobi Verified has made shopping in the CBD so much easier. I can find trusted vendors and know exactly where to go!',
      avatar: '/images/avatars/user1.jpg'
    },
    {
      id: 2,
      type: 'vendor',
      name: 'James K.',
      quote: 'Since joining as a verified vendor, my customer base has grown significantly. The platform is easy to use and the support is excellent.',
      avatar: '/images/avatars/user2.jpg'
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Nairobi Verified</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
                Connect with trusted vendors and shoppers in Nairobi CBD. Choose how you want to join our community.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/auth/register/client"
                  className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition-colors"
                >
                  Join as a Buyer
                </Link>
                <Link
                  href="/auth/register/merchant"
                  className="bg-black text-white hover:bg-gray-900 px-8 py-3 rounded-full font-semibold transition-colors"
                >
                  Join as a Vendor
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Options Section */}
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Buyer Option */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                    <FiShoppingBag size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Join as a Buyer</h2>
                  <p className="text-gray-600 mb-6">
                    Discover verified vendors in Nairobi CBD, shop with confidence, and easily locate physical stores.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900 mb-3">Benefits:</h3>
                  <ul className="space-y-2 mb-8">
                    {buyerBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href="/auth/register/client"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-md font-medium transition-colors"
                  >
                    Create Buyer Account
                  </Link>
                </div>
              </motion.div>
              
              {/* Vendor Option */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6">
                    <FiStore size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Join as a Vendor</h2>
                  <p className="text-gray-600 mb-6">
                    Showcase your business, reach more customers, and grow your sales with our trusted platform.
                  </p>
                  
                  <h3 className="font-semibold text-gray-900 mb-3">Benefits:</h3>
                  <ul className="space-y-2 mb-8">
                    {vendorBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href="/auth/register/merchant"
                    className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-3 rounded-md font-medium transition-colors"
                  >
                    Create Vendor Account
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-16 px-4 bg-gray-100">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hear from buyers and vendors who are already part of the Nairobi Verified community.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.5, delay: 0.2 + (index * 0.2) }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500">
                        {testimonial.type === 'buyer' ? 'Buyer' : 'Verified Vendor'}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Getting started with Nairobi Verified is easy, whether you're a buyer or a vendor.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* For Buyers */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiShoppingBag className="text-blue-600 mr-2" />
                  For Buyers
                </h3>
                
                <div className="space-y-8">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex"
                  >
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Create an account</h4>
                      <p className="text-gray-600">
                        Sign up with your email address and create a secure password.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex"
                  >
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Browse verified vendors</h4>
                      <p className="text-gray-600">
                        Explore shops and products from trusted vendors in Nairobi CBD.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex"
                  >
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Shop with confidence</h4>
                      <p className="text-gray-600">
                        Make purchases online or visit physical stores with easy-to-follow directions.
                      </p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="mt-8">
                  <Link
                    href="/auth/register/client"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Get started as a buyer
                    <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
              
              {/* For Vendors */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiStore className="text-orange-600 mr-2" />
                  For Vendors
                </h3>
                
                <div className="space-y-8">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex"
                  >
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Register your business</h4>
                      <p className="text-gray-600">
                        Create a vendor account with your business details and location information.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex"
                  >
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Complete verification</h4>
                      <p className="text-gray-600">
                        Submit required documents to get verified and earn the trust badge.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex"
                  >
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Set up your shop</h4>
                      <p className="text-gray-600">
                        Add your products, set prices, and customize your online storefront.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex"
                  >
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                        4
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Start selling</h4>
                      <p className="text-gray-600">
                        Receive orders, manage inventory, and grow your business with our platform.
                      </p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="mt-8">
                  <Link
                    href="/auth/register/merchant"
                    className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium"
                  >
                    Get started as a vendor
                    <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 text-white py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Ready to Join Nairobi Verified?</h2>
              <p className="text-xl max-w-2xl mx-auto mb-8">
                Whether you're looking to shop or sell, join our community today and experience the benefits.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/auth/register/client"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold transition-colors"
                >
                  Join as a Buyer
                </Link>
                <Link
                  href="/auth/register/merchant"
                  className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-3 rounded-md font-semibold transition-colors"
                >
                  Join as a Vendor
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}