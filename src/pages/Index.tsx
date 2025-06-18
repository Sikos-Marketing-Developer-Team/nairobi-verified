
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

const Index = () => {
  const isLoading = usePageLoading(800);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <HeroSkeleton />
        
        <PageSkeleton>
          <div className="space-y-16">
            {/* How It Works Section Skeleton */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center space-y-4">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Category Section Skeleton */}
            <CategorySkeleton />

            {/* Flash Sales Section Skeleton */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <ProductGridSkeleton />
            </div>

            {/* Featured Products Section Skeleton */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <ProductGridSkeleton />
            </div>

            {/* Trust Section Skeleton */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center space-y-4">
                    <Skeleton className="h-12 w-12 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <HowItWorks />
      <CategorySection />
      <FlashSales />
      <FeaturedProducts />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default Index;
