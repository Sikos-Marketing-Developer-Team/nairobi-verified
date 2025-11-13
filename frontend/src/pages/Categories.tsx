import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MapPin, Star, Heart, Filter, Search, ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { usePageLoading } from '@/hooks/use-loading';
import { CategorySkeleton, ProductGridSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { productsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

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

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: number;
  merchant?: { _id?: string; businessName?: string; verified?: boolean; address?: string; };
  merchantId?: string;
  merchantName?: string;
  location?: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    const productId = product._id || product.id;
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  const displayImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop';
  const merchantName = product.merchant?.businessName || product.merchantName || 'Unknown Merchant';
  const isVerified = product.merchant?.verified || false;
  const locationDisplay = product.merchant?.address || product.location || 'Location not specified';
  const reviewCount = product.reviewCount || product.reviews || 0;

  return (
    <Card className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden group transition-transform duration-200 hover:scale-105" onClick={handleCardClick}>
      <CardContent className="p-0">
        <div className="relative">
          <img src={displayImage} alt={product.name} className="w-full h-32 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
          {product.featured && (
            <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-secondary text-secondary-foreground px-1 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-medium">
              Featured
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 md:top-2 md:right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 md:p-2"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Added ${product.name} to wishlist!`);
            }}
          >
            <Heart className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
        <div className="p-2 md:p-4">
          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
            <span className="text-[10px] md:text-sm text-gray-600 line-clamp-1">{merchantName}</span>
            {isVerified && (
              <div className="flex items-center gap-0.5 md:gap-1 bg-green-100 text-green-800 text-[10px] md:text-xs px-1 py-0.5 rounded flex-shrink-0">
                <Check className="h-2.5 w-2.5 md:h-3 md:w-3" />
                Verified
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 text-[11px] md:text-base leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="text-[10px] md:text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
            <MapPin className="h-2.5 md:h-4 w-2.5 md:w-4 text-gray-400" />
            <span className="line-clamp-1">{locationDisplay}</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3 flex-wrap">
            <div className="flex items-center">
              <Star className="h-2.5 md:h-4 w-2.5 md:w-4 text-yellow-400 fill-current" />
              <span className="text-[10px] md:text-sm font-medium ml-0.5 md:ml-1">{product.rating || 0}</span>
            </div>
            <span className="text-[10px] md:text-sm text-gray-500">({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 mb-3 md:mb-4 flex-wrap">
            <span className="text-sm md:text-xl font-bold text-primary leading-tight">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] md:text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Button
            className="w-full text-xs md:text-base"
            onClick={(e) => {
              e.stopPropagation();
              const productId = product._id || product.id;
              if (productId) {
                navigate(`/product/${productId}`);
              }
            }}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface Category {
  id: string;
  name: string;
  count: string;
  image: string;
  color: string;
}

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Card className="hover-scale cursor-pointer border-0 shadow-lg snap-center flex-shrink-0 w-64">
      <CardContent className="p-0">
        <div className="relative h-40 overflow-hidden rounded-t-lg">
          <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <p className="text-xs opacity-90">{category.count}</p>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Verified merchants only</span>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CategorySection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Swipe & drag state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    const updateView = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? window.innerWidth - 32 : 800;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? window.innerWidth - 32 : 800;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const updateCurrentIndex = () => {
    if (scrollContainerRef.current) {
      const scrollPos = scrollContainerRef.current.scrollLeft;
      const itemWidth = isMobile ? window.innerWidth - 16 : 280;
      const newIndex = Math.round(scrollPos / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  // === SWIPE & DRAG HANDLERS ===
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    touchStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchEndX.current = touchStartX.current;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;

    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = touchStartX.current - currentX;

    scrollContainerRef.current.scrollLeft += diff;
    touchStartX.current = currentX;
    touchEndX.current = currentX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    isDragging.current = false;

    const diff = touchEndX.current - touchStartX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) scrollRight();
      else scrollLeft();
    }

    setTimeout(updateCurrentIndex, 150);
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging.current) handleTouchEnd();
  };

  return (
    <section className="py-4 md:py-6 lg:py-8">
      <div className="w-full px-2 sm:px-4 lg:px-2">
        <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-semibold text-gray-900 mb-5 mx-1">
          Shop by Category
        </h2>
        <div className="relative">
          <Button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-orange-500 hover:bg-orange-600 shadow-md h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full p-0"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-5 lg:w-5 text-white" />
          </Button>
          <Button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-orange-500 hover:bg-orange-600 shadow-md h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full p-0"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-5 lg:w-5 text-white" />
          </Button>

          <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-[10px] sm:text-xs md:text-xs lg:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {Math.min(currentIndex + (isMobile ? 1 : 3), categories.length)} / {categories.length}
          </div>

          {isMobile ? (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-2 md:pb-4 space-x-3 hide-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={updateCurrentIndex}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {categories.map((category) => (
                <div key={category.id} className="flex-shrink-0 snap-center" style={{ width: 'calc(100vw - 32px)' }}>
                  <Link to={`/categories/${category.id}`}>
                    <Card className="hover-scale cursor-pointer border-0 shadow-md sm:shadow-lg h-full">
                      <CardContent className="p-0 flex flex-col h-full">
                        <div className="relative h-48 overflow-hidden rounded-t-lg flex-grow">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-3 left-3 text-white">
                            <h3 className="text-base font-semibold">{category.name}</h3>
                            <p className="text-xs opacity-90">{category.count}</p>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Verified merchants</span>
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 space-x-4 hide-scrollbar snap-x snap-mandatory w-full cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={updateCurrentIndex}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {categories.map((category) => (
                <div key={category.id} className="snap-center flex-shrink-0">
                  <Link to={`/categories/${category.id}`}>
                    <CategoryCard category={category} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hover-scale:hover { transform: scale(1.02); transition: transform 0.2s ease-in-out; }
      `}</style>
    </section>
  );
};

const Categories = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const isPageLoading = usePageLoading(650);
  const { toast } = useToast();

  const selectedCategory = categoryId ? categories.find(cat => cat.id === categoryId) : null;

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: 12,
        };
        if (selectedCategory) {
          params.category = selectedCategory.name;
        }
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        if (priceRange[0] > 0) {
          params.minPrice = priceRange[0];
        }
        if (priceRange[1] < 200000) {
          params.maxPrice = priceRange[1];
        }

        const response = await productsAPI.getProducts(params);
        const productsData = response.data.data || [];
        const paginationData = response.data.pagination || { total: 0 };
        setProducts(productsData);
        setTotalProducts(paginationData.total);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [categoryId, searchTerm, priceRange, currentPage, selectedCategory, toast]);

  const filteredProducts = products;

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-36 md:pt-32 lg:pt-36">
          <PageSkeleton>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
                {!categoryId ? (
                  <CategorySkeleton />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <Skeleton className="h-12 flex-1" />
                        <div className="flex gap-2">
                          <Skeleton className="h-12 w-32" />
                          <Skeleton className="h-12 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-32" />
                    </div>
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
      <main className="pt-36 md:pt-32 lg:pt-36 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {selectedCategory ? selectedCategory.name : 'All Categories'}
            </h1>
            <p className="text-sm md:text-base text-orange-600">
              {selectedCategory
                ? `Browse verified merchants offering ${selectedCategory.name.toLowerCase()}`
                : 'Browse all categories or select one to filter products'}
            </p>
          </div>

          {!selectedCategory && <CategorySection />}

          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 md:h-5 w-4 md:w-5" />
                <Input
                  type="text"
                  placeholder="Search products or merchants..."
                  className="pl-10 text-xs md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-xs md:text-base"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 md:h-5 w-4 md:w-5" />
                Filters
                <ChevronDown className={`h-3 md:h-4 w-3 md:w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {showFilters && (
              <div className="bg-white p-3 md:p-4 rounded-lg shadow mb-6">
                <h3 className="font-medium mb-4 text-xs md:text-base">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 200000]}
                    max={200000}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex justify-between text-xs md:text-sm text-gray-600">
                    <span>KES {priceRange[0].toLocaleString()}</span>
                    <span>KES {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900">
                {selectedCategory ? `${selectedCategory.name} Products` : 'All Products'}
              </h2>
              <span className="text-xs md:text-base text-gray-600">{totalProducts} products</span>
            </div>

            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 md:h-8 w-6 md:w-8 animate-spin" />
                <span className="ml-2 text-xs md:text-base">Loading products...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-xs md:text-base text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <Button
                  variant="outline"
                  className="text-xs md:text-base"
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
      <style>{`
        @media (max-width: 768px) {
          .pt-36 { padding-top: 9rem; }
        }
      `}</style>
    </div>
  );
};

export default Categories;