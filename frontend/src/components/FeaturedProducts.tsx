import React, { useRef } from 'react';
import ProductCard from './ProductCard';
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
  
  // For mobile scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll functions for mobile
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
            
            {/* Mobile View with Horizontal Scroll */}
            <div className="md:hidden relative">
              <button 
                onClick={scrollLeft}
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
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              <button 
                onClick={scrollRight}
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
            <FiChevronRight className="ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;