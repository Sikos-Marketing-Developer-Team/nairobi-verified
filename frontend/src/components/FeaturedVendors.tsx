'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useApi } from '../hooks/useApi';
import { apiService } from '../lib/api';
import VendorCard from './VendorCard';
import { Merchant } from '../types/api';

interface FeaturedVendorsProps {
  title?: string;
  subtitle?: string;
}

export default function FeaturedVendors({
  title = 'Featured Vendors',
  subtitle = 'Explore top verified merchants in Nairobi',
}: FeaturedVendorsProps) {
  const { data: merchants, isLoading, error } = useApi<Merchant[]>(apiService.merchants.getFeatured);

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
          <div className="text-center">Loading vendors...</div>
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
          <div className="text-center text-red-600">Error loading vendors: {error?.message || 'Unknown error'}</div>
        </div>
      </section>
    );
  }

  if (!merchants || merchants.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-8">{subtitle}</p>
          <div className="text-center">No featured vendors available.</div>
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
            {merchants.map((merchant) => (
              <div key={merchant._id} className="snap-start flex-shrink-0 w-64 mx-2">
                <Link href={`/merchants/${merchant._id}`}>
                  <VendorCard merchant={merchant} />
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