
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import CategorySection from '@/components/CategorySection';
import FlashSales from '@/components/FlashSales';
import FeaturedProducts from '@/components/FeaturedProducts';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { HeroSkeleton, CategorySkeleton, ProductGridSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import FlashSaleDetail from './FlashSaleDetail';
import Categories from './Categories';

const Index = () => {
  const isLoading = usePageLoading(300);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white animate-fadeIn">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 animate-slideInUp">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-medium">Loading Nairobi Verified...</p>
              <p className="text-gray-400 text-sm mt-1">Connecting you to trusted merchants</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <FlashSales />
      <FeaturedProducts />
      <CategorySection />
      <TrustSection />
      <Footer />

    </div>
  );
};

export default Index;
