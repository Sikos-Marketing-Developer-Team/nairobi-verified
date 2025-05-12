import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for now - will be replaced with API call
const mockCategories = [
  {
    _id: '1',
    name: 'Electronics',
    slug: 'electronics',
    icon: '🔌',
    image: '/images/categories/electronics.svg',
    description: 'Latest gadgets and electronic devices'
  },
  {
    _id: '2',
    name: 'Fashion',
    slug: 'fashion',
    icon: '👕',
    image: '/images/categories/fashion.svg',
    description: 'Trendy clothing and accessories'
  },
  {
    _id: '3',
    name: 'Home & Living',
    slug: 'home-living',
    icon: '🏠',
    image: '/images/categories/home.svg',
    description: 'Furniture and home decor'
  },
  {
    _id: '4',
    name: 'Health & Beauty',
    slug: 'health-beauty',
    icon: '💄',
    image: '/images/categories/beauty.svg',
    description: 'Personal care and beauty products'
  },
  {
    _id: '5',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    icon: '⚽',
    image: '/images/categories/sports.svg',
    description: 'Sports equipment and outdoor gear'
  },
  {
    _id: '6',
    name: 'Books & Media',
    slug: 'books-media',
    icon: '📚',
    image: '/images/categories/books.svg',
    description: 'Books, music, and entertainment'
  }
];

interface FeaturedCategoriesProps {
  title?: string;
  subtitle?: string;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  title = "Shop by Category",
  subtitle = "Browse our wide selection of categories from verified vendors"
}) => {
  const [categories, setCategories] = useState(mockCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch featured categories from API
  useEffect(() => {
    const fetchFeaturedCategories = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/categories/featured');
        // const data = await response.json();
        // setCategories(data.categories);
        
        // Using mock data for now
        setTimeout(() => {
          setCategories(mockCategories);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load categories');
        setLoading(false);
      }
    };
    
    fetchFeaturedCategories();
  }, []);
  
  return (
    <section className="py-12 px-4 bg-white dark:bg-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400 py-8">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map(category => (
              <Link 
                key={category._id} 
                href={`/category/${category.slug}`}
                className="group"
              >
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-32 md:h-40 bg-gray-200 dark:bg-gray-600">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {category.icon}
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden md:block">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;