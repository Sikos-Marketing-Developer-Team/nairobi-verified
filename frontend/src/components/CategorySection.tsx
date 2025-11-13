import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  {
    id: '60d0fe4f5311236168a10101',
    name: 'Electronics',
    count: '500+ Products',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop',
    color: 'bg-blue-100'
  },
  {
    id: '60d0fe4f5311236168a10102',
    name: 'Fashion & Clothing',
    count: '800+ Products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
    color: 'bg-pink-100'
  },
  {
    id: '60d0fe4f5311236168a10103',
    name: 'Home & Garden',
    count: '300+ Products',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
    color: 'bg-green-100'
  },
  {
    id: '60d0fe4f5311236168a10104',
    name: 'Books & Media',
    count: '200+ Products',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
    color: 'bg-yellow-100'
  },
  {
    id: '60d0fe4f5311236168a10105',
    name: 'Sports & Fitness',
    count: '150+ Products',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
    color: 'bg-purple-100'
  },
  {
    id: '60d0fe4f5311236168a10106',
    name: 'Health & Beauty',
    count: '400+ Products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop',
    color: 'bg-indigo-100'
  },
  // NEW CATEGORIES
  {
    id: '60d0fe4f5311236168a10107',
    name: 'Transport & Mobility',
    count: '50+ Services',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop',
    color: 'bg-orange-100'
  },
  {
    id: '60d0fe4f5311236168a10108',
    name: 'Printing & Stationery',
    count: '200+ Products',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop',
    color: 'bg-teal-100'
  },
  {
    id: '60d0fe4f5311236168a10110',
    name: 'Events & Decorations',
    count: '100+ Services',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=200&fit=crop',
    color: 'bg-fuchsia-100'
  },
  {
    id: '60d0fe4f5311236168a10111',
    name: 'Household & Kitchen',
    count: '350+ Products',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
    color: 'bg-amber-100'
  },
  {
    id: '60d0fe4f5311236168a10112',
    name: 'Medical & Wellness',
    count: '120+ Products',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop',
    color: 'bg-red-100'
  },
  {
    id: '60d0fe4f5311236168a10113',
    name: 'Beauty & Personal Care',
    count: '300+ Products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop',
    color: 'bg-violet-100'
  },
  {
    id: '60d0fe4f5311236168a10114',
    name: 'Business Services',
    count: '80+ Services',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop',
    color: 'bg-cyan-100'
  },
  {
    id: '60d0fe4f5311236168a10115',
    name: 'Automotive',
    count: '180+ Products',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=300&h=200&fit=crop',
    color: 'bg-gray-100'
  },
  {
    id: '60d0fe4f5311236168a10116',
    name: 'Food & Beverages',
    count: '400+ Products',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
    color: 'bg-lime-100'
  }
];
const CategorySection = () => {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(1);

  // Calculate visible items based on screen width
  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1.2); // Show partial next item on mobile
      } else if (window.innerWidth < 768) {
        setVisibleItems(2);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(3);
      } else {
        setVisibleItems(4);
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Calculate current slide for the counter
  const updateCurrentIndex = () => {
    if (scrollContainerRef.current) {
      const scrollPos = scrollContainerRef.current.scrollLeft;
      const itemWidth = scrollContainerRef.current.scrollWidth / categories.length;
      const newIndex = Math.round(scrollPos / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-4 md:mb-6 lg:mb-8">
          <h2 className="text-3xl sm:text-2xl md:text-3xl font-bold inter text-gray-900 mb-2 md:mb-3">
            Shop by Category
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
            Explore products from verified merchants across different categories
          </p>
        </div>

        {/* Carousel for all screen sizes */}
        <div className="relative">
          {/* Navigation buttons */}
          <Button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-orange-500 hover:bg-orange-600 shadow-md h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full p-0"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
          </Button>
          
          <Button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-orange-500 hover:bg-orange-600 shadow-md h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full p-0"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
          </Button>

          {/* Carousel counter - scaled down on mobile */}
          <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {Math.min(currentIndex + 1, categories.length)} / {categories.length}
          </div>

          {/* Horizontal scroll container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-2 md:pb-4 space-x-2 sm:space-x-3 md:space-x-4 hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={updateCurrentIndex}
          >
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex-shrink-0"
                style={{ width: `calc(${100 / visibleItems}% - 0.5rem)` }}
              >
                <Link 
                  to={`/products?category=${category.name.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                  className="block"
                >
                  <Card className="hover-scale cursor-pointer border-0 shadow-md sm:shadow-lg h-full">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Increased height for mobile - from h-24 to h-32 on mobile */}
                      <div className="relative h-36 sm:h-28 md:h-36 lg:h-48 overflow-hidden rounded-t-lg flex-grow">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 text-white">
                          <h3 className="text-xs sm:text-sm md:text-base font-semibold">{category.name}</h3>
                          <p className="text-[10px] sm:text-xs opacity-90">{category.count}</p>
                        </div>
                      </div>
                      {/* Increased padding for mobile - from p-1 to p-2 on mobile */}
                      <div className="p-2 sm:p-2 md:p-3 lg:p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-xs text-gray-500">Verified merchants</span>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-4 md:mt-6 lg:mt-8">
          <Link to="/categories">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white text-xs sm:text-sm md:text-base py-1 h-8 sm:h-9 md:h-10">
              View All Categories
              <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hover-scale:hover {
          transform: scale(1.02);
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default CategorySection;