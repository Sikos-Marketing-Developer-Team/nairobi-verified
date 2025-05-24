'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { apiService } from '@/lib/api';
import ProductCard from './ProductCard';
import { Product } from '@/types/api';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
}

export default function FeaturedProducts({
  title = 'Featured Products',
  subtitle = 'Discover our handpicked selection of top products from verified vendors',
}: FeaturedProductsProps) {
  const { data: products, isLoading, error } = useApi<Product[]>(apiService.products.getFeatured);

  // For mobile scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-8">{subtitle}</p>
          <div className="text-center text-red-600">Error loading products: {error}</div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-8">{subtitle}</p>
          <div className="text-center">No featured products available.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{subtitle}</p>
        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <i className="bx bx-chevron-left text-2xl"></i>
          </button>
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          >
            {products.map((product) => (
              <div key={product._id} className="snap-start flex-shrink-0 w-64 mx-2">
                <Link href={`/products/${product._id}`}>
                  <ProductCard product={product} />
                </Link>
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <i className="bx bx-chevron-right text-2xl"></i>
          </button>
        </div>
      </div>
    </section>
  );
}