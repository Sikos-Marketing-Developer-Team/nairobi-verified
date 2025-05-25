'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import LazyComponent from './LazyComponent';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useFeaturedProducts } from '@/hooks/useApi';
import { Product } from '@/types/api';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  title = "Featured Products", 
  subtitle = "Discover our handpicked selection of top products from verified vendors" 
}) => {
  const { data: products, isLoading, error } = useFeaturedProducts();
  const [isClient, setIsClient] = useState(false);
  
  // For mobile scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // This ensures hydration issues are avoided
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Scroll functions for mobile
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-8">{subtitle}</p>
          <div className="text-center">Loading products...</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" text="Loading products..." />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400 py-8">
            Failed to load featured products. Please try again later.
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No featured products available at the moment.
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <LazyComponent key={product._id} height="300px">
                  <Link href={`/products/${product._id}`}>
                    <ProductCard product={product} />
                  </Link>
                </LazyComponent>
              ))}
            </div>
            
            {/* Mobile View with Horizontal Scroll */}
            <div className="md:hidden relative">
              <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md"
                aria-label="Scroll left"
              >
                <FiChevronLeft className="text-gray-600 dark:text-gray-300" />
              </button>
              
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.map((product: Product) => (
                  <div key={product._id} className="w-64 flex-shrink-0 mx-2 snap-start">
                    <LazyComponent height="300px">
                      <Link href={`/products/${product._id}`}>
                        <ProductCard product={product} />
                      </Link>
                    </LazyComponent>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md"
                aria-label="Scroll right"
              >
                <FiChevronRight className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </>
        )}
        
        <div className="text-center mt-8">
          <a 
            href="/products" 
            className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
          >
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;