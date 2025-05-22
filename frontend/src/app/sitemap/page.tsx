import React from 'react';
import SiteMap from '@/components/SiteMap';

export const metadata = {
  title: 'Site Map | Nairobi Verified',
  description: 'Complete list of all pages and routes on Nairobi Verified platform',
};

export default function SiteMapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Site Map
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Complete overview of all pages and sections available on Nairobi Verified
            </p>
          </div>
        </div>
      </div>
      
      <SiteMap />
    </div>
  );
}