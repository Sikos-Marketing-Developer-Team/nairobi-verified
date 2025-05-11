"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiStar, 
  FiHeart, 
  FiShoppingCart, 
  FiGrid, 
  FiList,
  FiChevronRight,
  FiCheck,
  FiFilter
} from 'react-icons/fi';
import MainLayout from '@/components/MainLayout';

// Mock data for shops
const shopsData = {
  'tech-hub-electronics': {
    id: 1,
    slug: 'tech-hub-electronics',
    name: 'Tech Hub Electronics',
    logo: '/images/shops/tech-hub.jpg',
    coverImage: '/images/shops/tech-hub-cover.jpg',
    category: 'Electronics',
    location: 'Moi Avenue, Nairobi CBD',
    mapCoordinates: { lat: -1.2833, lng: 36.8167 },
    contactInfo: {
      phone: '+254 700 123 456',
      email: 'info@techhub.co.ke',
      website: 'www.techhub.co.ke',
      socialMedia: {
        facebook: 'techhubke',
        instagram: 'techhub_ke',
        twitter: 'techhub_ke'
      }
    },
    businessHours: [
      { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
      { day: 'Saturday', hours: '9:00 AM - 5:00 PM' },
      { day: 'Sunday', hours: 'Closed' }
    ],
    rating: 4.8,
    reviewCount: 124,
    verified: true,
    featured: true,
    description: 'Your one-stop shop for all electronics and gadgets. We offer a wide range of products including smartphones, laptops, accessories, and more. Our products come with warranty and after-sales support.',
    longDescription: `
      Tech Hub Electronics is a leading electronics retailer in Nairobi CBD, offering a wide range of high-quality electronics and gadgets at competitive prices. We pride ourselves on providing excellent customer service and expert advice to help you find the perfect tech solution for your needs.
      
      Our store features the latest smartphones, laptops, tablets, audio equipment, cameras, and accessories from top brands. All our products are genuine and come with manufacturer warranty.
      
      We also offer repair services, trade-ins, and technical support to ensure you get the most out of your tech purchases.
    `,
    established: 2015,
    paymentMethods: ['M-Pesa', 'Credit/Debit Cards', 'Bank Transfer', 'Cash'],
    categories: [
      { name: 'Smartphones', count: 24 },
      { name: 'Laptops', count: 18 },
      { name: 'Audio', count: 15 },
      { name: 'Accessories', count: 32 },
      { name: 'Cameras', count: 10 }
    ],
    products: [
      {
        id: 101,
        name: 'Smartphone Pro Max 128GB',
        price: 89999,
        discountPrice: 79999,
        image: '/images/products/smartphone.jpg',
        rating: 4.9,
        reviewCount: 56,
        inStock: true,
        isNew: true,
        isBestseller: true
      },
      {
        id: 102,
        name: 'Ultra Slim Laptop 15"',
        price: 129999,
        discountPrice: null,
        image: '/images/products/laptop.jpg',
        rating: 4.7,
        reviewCount: 42,
        inStock: true,
        isNew: false,
        isBestseller: true
      },
      {
        id: 103,
        name: 'Wireless Noise Cancelling Headphones',
        price: 24999,
        discountPrice: 19999,
        image: '/images/products/headphones.jpg',
        rating: 4.8,
        reviewCount: 38,
        inStock: true,
        isNew: true,
        isBestseller: false
      },
      {
        id: 104,
        name: 'Bluetooth Portable Speaker',
        price: 12999,
        discountPrice: 9999,
        image: '/images/products/speaker.jpg',
        rating: 4.6,
        reviewCount: 29,
        inStock: true,
        isNew: false,
        isBestseller: false
      },
      {
        id: 105,
        name: 'Smartwatch Series 5',
        price: 34999,
        discountPrice: 29999,
        image: '/images/products/smartwatch.jpg',
        rating: 4.7,
        reviewCount: 31,
        inStock: true,
        isNew: true,
        isBestseller: true
      },
      {
        id: 106,
        name: 'Wireless Charging Pad',
        price: 4999,
        discountPrice: 3999,
        image: '/images/products/charger.jpg',
        rating: 4.5,
        reviewCount: 24,
        inStock: true,
        isNew: false,
        isBestseller: false
      }
    ],
    reviews: [
      {
        id: 1,
        user: 'John D.',
        rating: 5,
        date: '2023-05-10',
        comment: 'Great selection of products and excellent customer service. The staff was very knowledgeable and helped me choose the perfect laptop for my needs.',
        avatar: '/images/avatars/user1.jpg'
      },
      {
        id: 2,
        user: 'Sarah M.',
        rating: 4,
        date: '2023-05-05',
        comment: 'Good prices and genuine products. I bought a smartphone and it came with proper warranty. The only reason for 4 stars is that I had to wait a bit for service.',
        avatar: '/images/avatars/user2.jpg'
      },
      {
        id: 3,
        user: 'Michael K.',
        rating: 5,
        date: '2023-04-28',
        comment: 'I\'ve been shopping here for years and have always had a positive experience. Their after-sales support is excellent, and they always honor their warranties.',
        avatar: '/images/avatars/user3.jpg'
      }
    ]
  },
  'fashion-trends': {
    id: 2,
    slug: 'fashion-trends',
    name: 'Fashion Trends',
    logo: '/images/shops/fashion-trends.jpg',
    coverImage: '/images/shops/fashion-trends-cover.jpg',
    category: 'Fashion',
    location: 'Kimathi Street, Nairobi CBD',
    mapCoordinates: { lat: -1.2845, lng: 36.8222 },
    contactInfo: {
      phone: '+254 700 234 567',
      email: 'info@fashiontrends.co.ke',
      website: 'www.fashiontrends.co.ke',
      socialMedia: {
        facebook: 'fashiontrendskenya',
        instagram: 'fashiontrends_ke',
        twitter: 'fashiontrends_ke'
      }
    },
    businessHours: [
      { day: 'Monday - Saturday', hours: '9:00 AM - 7:00 PM' },
      { day: 'Sunday', hours: '10:00 AM - 4:00 PM' }
    ],
    rating: 4.6,
    reviewCount: 98,
    verified: true,
    featured: true,
    description: 'Discover the latest fashion trends for men and women. We offer clothing, shoes, and accessories from top brands at affordable prices.',
    longDescription: `
      Fashion Trends is a premier fashion boutique located in the heart of Nairobi CBD. We curate the latest styles and trends from around the world to bring you fashionable clothing, shoes, and accessories at affordable prices.
      
      Our collection includes casual wear, formal attire, sportswear, and accessories for both men and women. We pride ourselves on offering high-quality fashion items that help you express your unique style.
      
      Our experienced staff is always ready to assist you in finding the perfect outfit for any occasion. We also offer alterations and styling advice to ensure you look your best.
    `,
    established: 2017,
    paymentMethods: ['M-Pesa', 'Credit/Debit Cards', 'Cash'],
    categories: [
      { name: 'Men\'s Clothing', count: 45 },
      { name: 'Women\'s Clothing', count: 62 },
      { name: 'Shoes', count: 28 },
      { name: 'Accessories', count: 35 }
    ],
    products: [
      {
        id: 201,
        name: 'Men\'s Casual Shirt',
        price: 2999,
        discountPrice: 2499,
        image: '/images/products/mens-shirt.jpg',
        rating: 4.5,
        reviewCount: 32,
        inStock: true,
        isNew: false,
        isBestseller: true
      },
      {
        id: 202,
        name: 'Women\'s Summer Dress',
        price: 3999,
        discountPrice: 3499,
        image: '/images/products/womens-dress.jpg',
        rating: 4.7,
        reviewCount: 28,
        inStock: true,
        isNew: true,
        isBestseller: true
      },
      {
        id: 203,
        name: 'Leather Handbag',
        price: 5999,
        discountPrice: null,
        image: '/images/products/handbag.jpg',
        rating: 4.8,
        reviewCount: 24,
        inStock: true,
        isNew: false,
        isBestseller: false
      },
      {
        id: 204,
        name: 'Men\'s Sneakers',
        price: 4999,
        discountPrice: 3999,
        image: '/images/products/sneakers.jpg',
        rating: 4.6,
        reviewCount: 36,
        inStock: true,
        isNew: true,
        isBestseller: false
      }
    ],
    reviews: [
      {
        id: 1,
        user: 'Emily W.',
        rating: 5,
        date: '2023-05-12',
        comment: 'Love this store! They always have the latest trends and the quality is excellent for the price. The staff is friendly and helpful.',
        avatar: '/images/avatars/user4.jpg'
      },
      {
        id: 2,
        user: 'David L.',
        rating: 4,
        date: '2023-05-03',
        comment: 'Great selection of men\'s clothing. I found exactly what I was looking for at a reasonable price. Will definitely shop here again.',
        avatar: '/images/avatars/user5.jpg'
      }
    ]
  }
};

export default function ShopPage({ params }: { params: { slug: string } }) {
  const [shop, setShop] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the shop data from an API
    // For now, we'll use our mock data
    const shopData = shopsData[params.slug as keyof typeof shopsData];
    if (shopData) {
      setShop(shopData);
    }
  }, [params.slug]);

  if (!shop) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">Shop not found</h1>
          <p className="mt-4">The shop you're looking for doesn't exist or has been removed.</p>
          <Link href="/shops" className="mt-6 inline-block text-orange-600 hover:underline">
            Browse all shops
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Filter products based on selected category
  const filteredProducts = shop.products.filter((product: any) => {
    if (selectedCategory === 'All') return true;
    
    // In a real app, each product would have a category field
    // For now, we'll just return all products
    return true;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-low':
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case 'price-high':
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1;
      case 'featured':
      default:
        return (a.isBestseller === b.isBestseller) ? 0 : a.isBestseller ? -1 : 1;
    }
  });

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Shop Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 md:h-80 bg-gray-300">
            {shop.coverImage ? (
              <Image
                src={shop.coverImage}
                alt={`${shop.name} cover`}
                width={1200}
                height={400}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-orange-500 to-red-500"></div>
            )}
          </div>
          
          <div className="container mx-auto px-4">
            {/* Shop Info Card */}
            <div className="relative -mt-20 bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row">
                {/* Logo */}
                <div className="md:mr-6 mb-4 md:mb-0">
                  <div className="w-24 h-24 rounded-lg border-4 border-white overflow-hidden bg-white -mt-12 md:-mt-16 shadow-md">
                    {shop.logo ? (
                      <Image
                        src={shop.logo}
                        alt={`${shop.name} logo`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No logo</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Shop Info */}
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{shop.name}</h1>
                      <div className="flex items-center mt-1 mb-2">
                        <span className="text-sm text-gray-600 mr-3">{shop.category}</span>
                        {shop.verified && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center">
                            <FiCheck className="mr-1" size={12} />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 md:mt-0 flex items-center">
                      <div className="flex items-center mr-4">
                        <div className="text-yellow-400 mr-1">
                          <FiStar className="fill-current" />
                        </div>
                        <span className="font-medium">{shop.rating}</span>
                        <span className="text-gray-600 ml-1">({shop.reviewCount} reviews)</span>
                      </div>
                      
                      <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
                        Contact Seller
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mt-2">{shop.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center text-gray-600">
                      <FiMapPin className="mr-1" size={16} />
                      <span>{shop.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-1" size={16} />
                      <a href={`tel:${shop.contactInfo.phone}`} className="hover:text-orange-600">
                        {shop.contactInfo.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FiMail className="mr-1" size={16} />
                      <a href={`mailto:${shop.contactInfo.email}`} className="hover:text-orange-600">
                        {shop.contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Shop Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({shop.reviewCount})
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'location'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Location
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'products' && (
            <div>
              {/* Filter Toggle (Mobile) */}
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                >
                  <span className="flex items-center">
                    <FiFilter className="mr-2" />
                    Filters & Sorting
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${showFilters ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="font-semibold text-lg mb-4">Categories</h2>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="cat-all"
                          name="category"
                          checked={selectedCategory === 'All'}
                          onChange={() => setSelectedCategory('All')}
                          className="mr-2"
                        />
                        <label htmlFor="cat-all" className="text-gray-700">All Products</label>
                      </div>
                      
                      {shop.categories.map((category: any) => (
                        <div key={category.name} className="flex items-center">
                          <input
                            type="radio"
                            id={`cat-${category.name}`}
                            name="category"
                            checked={selectedCategory === category.name}
                            onChange={() => setSelectedCategory(category.name)}
                            className="mr-2"
                          />
                          <label htmlFor={`cat-${category.name}`} className="text-gray-700">
                            {category.name} ({category.count})
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h2 className="font-semibold text-lg mb-4">Sort By</h2>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>
                    
                    {/* Apply/Reset Buttons (Mobile) */}
                    <div className="md:hidden mt-6 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setSortBy('featured');
                        }}
                        className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="flex-1 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Products */}
                <div className="md:w-3/4">
                  {/* View Options */}
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">{filteredProducts.length} products</p>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'text-gray-500'}`}
                      >
                        <FiGrid size={20} />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'text-gray-500'}`}
                      >
                        <FiList size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Products Grid/List */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product: any) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative">
                            <div className="h-48 bg-gray-200">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={300}
                                  height={300}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Badges */}
                            <div className="absolute top-0 left-0 flex flex-col">
                              {product.isNew && (
                                <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                                  NEW
                                </div>
                              )}
                              {product.isBestseller && (
                                <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                                  BESTSELLER
                                </div>
                              )}
                            </div>
                            
                            {/* Wishlist Button */}
                            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                              <FiHeart size={18} />
                            </button>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                            
                            <div className="flex items-center mb-2">
                              <div className="flex text-yellow-400 mr-1">
                                <FiStar className="fill-current" />
                              </div>
                              <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                {product.discountPrice ? (
                                  <div className="flex items-center">
                                    <span className="text-lg font-bold text-gray-900">KSh {product.discountPrice.toLocaleString()}</span>
                                    <span className="text-sm text-gray-500 line-through ml-2">KSh {product.price.toLocaleString()}</span>
                                  </div>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">KSh {product.price.toLocaleString()}</span>
                                )}
                              </div>
                              <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full">
                                <FiShoppingCart size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProducts.map((product: any) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-1/3 relative">
                              <div className="h-48 sm:h-full bg-gray-200">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-400">No image</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Badges */}
                              <div className="absolute top-0 left-0 flex flex-col">
                                {product.isNew && (
                                  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                                    NEW
                                  </div>
                                )}
                                {product.isBestseller && (
                                  <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                                    BESTSELLER
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="sm:w-2/3 p-4 flex flex-col justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                
                                <div className="flex items-center mb-2">
                                  <div className="flex text-yellow-400 mr-1">
                                    <FiStar className="fill-current" />
                                  </div>
                                  <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
                                </div>
                                
                                <p className="text-gray-600 mb-4">
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  {product.discountPrice ? (
                                    <div className="flex items-center">
                                      <span className="text-lg font-bold text-gray-900">KSh {product.discountPrice.toLocaleString()}</span>
                                      <span className="text-sm text-gray-500 line-through ml-2">KSh {product.price.toLocaleString()}</span>
                                    </div>
                                  ) : (
                                    <span className="text-lg font-bold text-gray-900">KSh {product.price.toLocaleString()}</span>
                                  )}
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button className="text-gray-500 hover:text-red-500 bg-gray-100 p-2 rounded-full">
                                    <FiHeart size={18} />
                                  </button>
                                  <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center">
                                    <FiShoppingCart size={18} className="mr-2" />
                                    Add to Cart
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About {shop.name}</h2>
              
              <div className="prose max-w-none text-gray-600">
                <p className="whitespace-pre-line">{shop.longDescription}</p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Business Information</h3>
                    <ul className="space-y-2">
                      <li className="flex">
                        <span className="font-medium text-gray-700 w-32">Established:</span>
                        <span>{shop.established}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium text-gray-700 w-32">Category:</span>
                        <span>{shop.category}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium text-gray-700 w-32">Location:</span>
                        <span>{shop.location}</span>
                      </li>
                      <li className="flex">
                        <span className="font-medium text-gray-700 w-32">Website:</span>
                        <a href={`https://${shop.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                          {shop.contactInfo.website}
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Business Hours</h3>
                    <ul className="space-y-2">
                      {shop.businessHours.map((hours: any, index: number) => (
                        <li key={index} className="flex justify-between">
                          <span className="font-medium text-gray-700">{hours.day}</span>
                          <span>{hours.hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {shop.paymentMethods.map((method: string, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Customer Reviews</h2>
                <div className="mt-2 md:mt-0 flex items-center">
                  <div className="text-yellow-400 mr-2">
                    <FiStar className="fill-current" size={24} />
                  </div>
                  <div>
                    <span className="font-bold text-xl">{shop.rating}</span>
                    <span className="text-gray-600 ml-1">out of 5</span>
                    <p className="text-sm text-gray-500">{shop.reviewCount} reviews</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {shop.reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start">
                      <div className="mr-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {review.avatar ? (
                            <Image
                              src={review.avatar}
                              alt={review.user}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span>{review.user.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <h3 className="font-medium text-gray-900">{review.user}</h3>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex text-yellow-400 my-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={i < review.rating ? 'fill-current' : ''}
                              size={16}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 mt-1">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors">
                  Write a Review
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'location' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location & Directions</h2>
              
              <div className="mb-6">
                <div className="flex items-start mb-4">
                  <FiMapPin className="text-orange-600 mt-1 mr-2" size={20} />
                  <div>
                    <h3 className="font-medium text-gray-900">Address</h3>
                    <p className="text-gray-600">{shop.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiClock className="text-orange-600 mt-1 mr-2" size={20} />
                  <div>
                    <h3 className="font-medium text-gray-900">Business Hours</h3>
                    <ul className="text-gray-600">
                      {shop.businessHours.map((hours: any, index: number) => (
                        <li key={index}>{hours.day}: {hours.hours}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-500">Map will be displayed here</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://maps.google.com/?q=${shop.location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-orange-600 text-white text-center py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Get Directions
                </a>
                <button className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                  Share Location
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}