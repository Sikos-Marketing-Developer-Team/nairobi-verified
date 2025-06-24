import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MapPin, Star, Heart, Filter, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { usePageLoading } from '@/hooks/use-loading';
import { CategorySkeleton, ProductGridSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

// Categories data (same as in CategorySection component)
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
  }
];

// Sample products data
const allProducts = [
  {
    id: 1,
    name: 'MacBook Pro 16-inch',
    price: 185000,
    originalPrice: 200000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    merchant: 'TechHub Kenya',
    location: 'Kimathi Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10101',
    category: 'Electronics'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: 120000,
    originalPrice: 135000,
    rating: 4.7,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    merchant: 'Mobile World',
    location: 'Tom Mboya Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10102',
    category: 'Electronics'
  },
  {
    id: 3,
    name: 'Nike Air Max 270',
    price: 12000,
    originalPrice: 15000,
    rating: 4.6,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    merchant: 'Sports Corner',
    location: 'Moi Avenue, CBD',
    verified: true,
    featured: false,
    merchantId: '60d0fe4f5311236168a10103',
    category: 'Fashion & Clothing'
  },
  {
    id: 4,
    name: 'Canon EOS R5 Camera',
    price: 75000,
    originalPrice: 85000,
    rating: 4.9,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop',
    merchant: 'PhotoPro Kenya',
    location: 'Koinange Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10104',
    category: 'Electronics'
  },
  {
    id: 5,
    name: 'Adidas Ultraboost 22',
    price: 14000,
    originalPrice: 16000,
    rating: 4.5,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop',
    merchant: 'Sports Corner',
    location: 'Moi Avenue, CBD',
    verified: true,
    featured: false,
    merchantId: '60d0fe4f5311236168a10103',
    category: 'Sports & Fitness'
  },
  {
    id: 6,
    name: 'Sony WH-1000XM5 Headphones',
    price: 35000,
    originalPrice: 40000,
    rating: 4.8,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop',
    merchant: 'TechHub Kenya',
    location: 'Kimathi Street, CBD',
    verified: true,
    featured: false,
    merchantId: '60d0fe4f5311236168a10101',
    category: 'Electronics'
  },
  {
    id: 7,
    name: 'Monstera Deliciosa Plant',
    price: 2500,
    originalPrice: 3000,
    rating: 4.7,
    reviews: 19,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop',
    merchant: 'Green Thumb',
    location: 'Kenyatta Avenue, CBD',
    verified: true,
    featured: false,
    merchantId: '60d0fe4f5311236168a10105',
    category: 'Home & Garden'
  },
  {
    id: 8,
    name: 'The Alchemist (Paperback)',
    price: 1200,
    originalPrice: 1500,
    rating: 4.9,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
    merchant: 'City Books',
    location: 'Biashara Street, CBD',
    verified: true,
    featured: false,
    merchantId: '60d0fe4f5311236168a10106',
    category: 'Books & Media'
  }
];

const ProductCard = ({ product }: { product: typeof allProducts[0] }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {product.featured && (
            <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
              Featured
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert('Added to favorites!');
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">{product.merchant}</span>
            {product.verified && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                <Check className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <Link to={`/merchant/${product.merchantId}`} className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{product.location}</span>
          </Link>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <Button className="w-full bg-primary hover:bg-primary-dark text-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`Added ${product.name} to cart!`);
            }}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CategoryCard = ({ category }: { category: typeof categories[0] }) => {
  return (
    <Card className="hover-scale cursor-pointer border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <p className="text-sm opacity-90">{category.count}</p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Verified merchants only</span>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Categories = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [showFilters, setShowFilters] = useState(false);
  const isLoading = usePageLoading(650);

  // Find the selected category
  const selectedCategory = categoryId 
    ? categories.find(cat => cat.id === categoryId) 
    : null;

  // Filter products based on category and search term
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory 
      ? product.category === selectedCategory.name 
      : true;
    
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

// (Removed duplicate/incorrect loading block that referenced 'product')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Fixed spacing: proper padding-top for header clearance */}
        <div className="pt-24 md:pt-32 lg:pt-36">
          <PageSkeleton>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-8">
                {/* Header Section Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                </div>

                {/* Categories or Filters Section Skeleton */}
                {!categoryId ? (
                  <CategorySkeleton />
                ) : (
                  <div className="space-y-6">
                    {/* Search and Filters Skeleton */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <Skeleton className="h-12 flex-1" />
                        <div className="flex gap-2">
                          <Skeleton className="h-12 w-32" />
                          <Skeleton className="h-12 w-24" />
                        </div>
                      </div>
                    </div>

                    {/* Results Header Skeleton */}
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-32" />
                    </div>

                    {/* Products Grid Skeleton */}
                    <ProductGridSkeleton />
                  </div>
                )}
              </div>
            </div>
          </PageSkeleton>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Fixed: proper spacing after header, removed duplicate padding */}
      <main className="pt-24 md:pt-32 lg:pt-36 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedCategory ? selectedCategory.name : 'All Categories'}
            </h1>
            <p className="text-orange-600 text-sm">
              {selectedCategory 
                ? `Browse verified merchants offering ${selectedCategory.name.toLowerCase()}`
                : 'Browse all categories or select one to filter products'}
            </p>
          </div>

          {/* Categories Section (only show if no category is selected) */}
          {!selectedCategory && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shop by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link key={category.id} to={`/categories/${category.id}`}>
                    <CategoryCard category={category} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products or merchants..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {showFilters && (
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 200000]}
                    max={200000}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>KES {priceRange[0].toLocaleString()}</span>
                    <span>KES {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedCategory ? `${selectedCategory.name} Products` : 'All Products'}
              </h2>
              <span className="text-gray-600">{filteredProducts.length} products</span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <ProductCard product={product} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setPriceRange([0, 200000]);
                    if (selectedCategory) {
                      navigate('/categories');
                    }
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;