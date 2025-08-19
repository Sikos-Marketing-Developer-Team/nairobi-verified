
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

const Index = () => {
  const isLoading = usePageLoading(800);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
      

         
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
     <FlashSaleDetail/>
     <FeaturedProducts />
     <HowItWorks />
     <Footer />
     
    </div>
  );
};

export default Index;
