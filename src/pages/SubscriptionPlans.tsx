import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const SubscriptionPlans = () => {
  const isLoading = usePageLoading(650);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <Header />
        
        {/* Hero Section Skeleton */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-5/6 mx-auto" />
          </div>
        </section>

        <PageSkeleton>
          <div className="space-y-12">
            {/* Pricing Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-24 mx-auto" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center space-x-3">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                  
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>

            {/* FAQ Section Skeleton */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Header />
      <div className="max-w-4xl mx-auto text-center px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Subscription Plans</h1>
        <p className="text-gray-600">Choose the perfect plan for your business needs</p>
        {/* TODO: Add actual subscription plans content */}
      </div>
      <Footer />
    </div>
  );
};

export default SubscriptionPlans; 