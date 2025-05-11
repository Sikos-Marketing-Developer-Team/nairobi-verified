import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Mock data for now - will be replaced with API call
const mockProducts = [
  {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 5999,
    discountPrice: 4999,
    images: [{ url: '/images/products/headphones.jpg', isMain: true }],
    ratings: { average: 4.5, count: 128 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '2',
    name: 'Smartphone Stand with Wireless Charger',
    price: 2500,
    discountPrice: 1999,
    images: [{ url: '/images/products/phone-stand.jpg', isMain: true }],
    ratings: { average: 4.2, count: 75 },
    merchant: { _id: '102', companyName: 'Gadget World', isVerified: true }
  },
  {
    _id: '3',
    name: 'Leather Laptop Sleeve Case',
    price: 3500,
    discountPrice: null,
    images: [{ url: '/images/products/laptop-case.jpg', isMain: true }],
    ratings: { average: 4.8, count: 92 },
    merchant: { _id: '103', companyName: 'Fashion Store', isVerified: false }
  },
  {
    _id: '4',
    name: 'Smart Watch with Heart Rate Monitor',
    price: 8999,
    discountPrice: 7499,
    images: [{ url: '/images/products/smartwatch.jpg', isMain: true }],
    ratings: { average: 4.3, count: 156 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '5',
    name: 'Portable Bluetooth Speaker',
    price: 4500,
    discountPrice: 3999,
    images: [{ url: '/images/products/speaker.jpg', isMain: true }],
    ratings: { average: 4.1, count: 112 },
    merchant: { _id: '102', companyName: 'Gadget World', isVerified: true }
  },
  {
    _id: '6',
    name: 'Ergonomic Office Chair',
    price: 12999,
    discountPrice: 10999,
    images: [{ url: '/images/products/chair.jpg', isMain: true }],
    ratings: { average: 4.7, count: 64 },
    merchant: { _id: '104', companyName: 'Home Essentials', isVerified: true }
  },
  {
    _id: '7',
    name: 'Wireless Gaming Mouse',
    price: 3999,
    discountPrice: null,
    images: [{ url: '/images/products/mouse.jpg', isMain: true }],
    ratings: { average: 4.4, count: 89 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '8',
    name: 'Stainless Steel Water Bottle',
    price: 1500,
    discountPrice: 1299,
    images: [{ url: '/images/products/bottle.jpg', isMain: true }],
    ratings: { average: 4.6, count: 203 },
    merchant: { _id: '105', companyName: 'Eco Friendly', isVerified: true }
  }
];

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  title = "Featured Products", 
  subtitle = "Discover our handpicked selection of top products from verified vendors" 
}) => {
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For mobile scrolling
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll functions for mobile
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/products/featured');
        // const data = await response.json();
        // setProducts(data.products);
        
        // Using mock data for now
        setTimeout(() => {
          setProducts(mockProducts);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load featured products');
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);
  
  // Handle add to cart
  const handleAddToCart = (productId: string) => {
    console.log(`Adding product ${productId} to cart`);
    // Implement cart functionality
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = (productId: string) => {
    console.log(`Adding product ${productId} to wishlist`);
    // Implement wishlist functionality
  };
  
  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
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
          <>
            {/* Desktop View */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
            
            {/* Mobile View with Horizontal Scroll */}
            <div className="md:hidden relative">
              <button 
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md"
                aria-label="Scroll left"
              >
                <FiChevronLeft className="text-gray-600 dark:text-gray-300" />
              </button>
              
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.map(product => (
                  <div key={product._id} className="w-64 flex-shrink-0 mx-2 snap-start">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  </div>
                ))}
              </div>
              
              <button 
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md"
                aria-label="Scroll right"
              >
                <FiChevronRight className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </>
        )}
        
        <div className="text-center mt-8">
          <a 
            href="/products" 
            className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
          >
            View All Products
            <FiChevronRight className="ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;