import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFeaturedCategories } from '../hooks/useApi';
import { Category } from '../types/api';

// Default icons for categories without images
const categoryIcons: Record<string, string> = {
  'electronics': '🔌',
  'fashion': '👕',
  'home-living': '🏠',
  'health-beauty': '💄',
  'sports-outdoors': '⚽',
  'books-media': '📚',
  'food-beverages': '🍔',
  'toys-games': '🎮',
  'automotive': '🚗',
  'jewelry': '💍',
  'default': '📦'
};

interface FeaturedCategoriesProps {
  title?: string;
  subtitle?: string;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  title = "Shop by Category",
  subtitle = "Browse our wide selection of categories from verified vendors"
}) => {
  const { categories, isLoading, error, usedFallback } = useFeaturedCategories();
  
  // Get appropriate icon for a category
  const getCategoryIcon = (category: Category): string => {
    if (category.slug && categoryIcons[category.slug]) {
      return categoryIcons[category.slug];
    }
    return categoryIcons.default;
  };
  
  return (
    <section className="py-12 px-4 bg-white dark:bg-gray-800">
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
            Failed to load categories. Please try again later.
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No categories available at the moment.
          </div>
        ) : (
          <>
            {/* Fallback data notice */}
            {usedFallback && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Showing sample categories. Unable to connect to the server.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map((category: Category) => (
                <Link 
                  key={category._id} 
                  href={`/category/${category.slug}`}
                  className="group"
                >
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative h-32 md:h-40 bg-gray-200 dark:bg-gray-600">
                      {category.image ? (
                        <Image
                          src={category.image.startsWith('http') ? category.image : `/${category.image}`}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {getCategoryIcon(category)}
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden md:block">
                        {category.description || `Explore our ${category.name} collection`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Retry button when using fallback data */}
            {usedFallback && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-md transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Retry Connection
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;