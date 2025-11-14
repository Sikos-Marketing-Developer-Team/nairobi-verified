import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart, ArrowLeft, Phone, Mail, Shield, Truck, Clock, Users, Image, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTwitter } from 'react-icons/fa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productsAPI } from '@/lib/api';
import { reviewsAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  primaryImage?: string;
  category: string;
  inStock: boolean;
  merchant: {
    _id: string;
    businessName: string;
    location?: {
      address?: string;
      city?: string;
    };
    verified?: boolean;
    rating?: number;
    phone?: string;
    email?: string;
    whatsappNumber?: string;
  };
  stockQuantity?: number;
  totalReviews?: number;
  rating?: number;
  tags?: string[];
  specifications?: Record<string, string | number>;
}

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  merchant: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful?: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [activeTab, setActiveTab] = useState("recently-viewed");
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [mostViewedProducts, setMostViewedProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  const galleryRef = useRef(null);
  const relatedProductsRef = useRef(null);
  const shareRef = useRef(null);

  // Minimum swipe distance required
  const minSwipeDistance = 50;

  // Helper function to format WhatsApp number
  const formatWhatsAppNumber = (number: string) => {
    if (!number) return '254712345678'; // fallback number
    
    // Remove any spaces, dashes, plus signs
    let cleaned = number.replace(/[\s\-+]/g, '');
    
    // If number starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If number doesn't start with country code, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getProduct(id!);
      
      if (response.data.success) {
        const productData = response.data.data || response.data.product;
        setProduct(productData);
        
        // Check if product is in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(id));

        // Load reviews for this merchant
        await loadReviews(productData.merchant._id);
        
        // Load related products by category - USING EXACT SAME LOGIC AS PRODUCTS COMPONENT
        await loadRelatedProducts(productData.category, productData._id);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      toast.error('Failed to load product details');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async (merchantId: string) => {
    try {
      const response = await reviewsAPI.getReviews(merchantId);
      if (response.data.success) {
        setReviews(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  // EXACT SAME IMPLEMENTATION AS PRODUCTS COMPONENT
  const loadRelatedProducts = async (category: string, excludeId: string) => {
    try {
      console.log('Loading related products for category:', category);
      
      // Use the exact same API call pattern as Products component
      const response = await productsAPI.getProducts({
        category: category,
        page: 1,
        limit: 12
      });
      
      let productsData: Product[] = [];
      
      // EXACT SAME DATA EXTRACTION LOGIC AS PRODUCTS COMPONENT
      if (response && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else if (typeof response.data === 'object' && response.data._id) {
          productsData = [response.data];
        }
      }
      
      console.log('Raw related products data:', productsData);
      
      // Filter out the current product and limit to 8 products
      const filteredProducts = productsData
        .filter(product => product._id !== excludeId)
        .slice(0, 8);
      
      console.log('Filtered related products:', filteredProducts);
      setRelatedProducts(filteredProducts);
    } catch (error) {
      console.error('Failed to load related products:', error);
      setRelatedProducts([]);
    }
  };

  const toggleFavorite = () => {
    if (!product) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((favId: string) => favId !== product._id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast.success('Removed from favorites');
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, product._id];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
      toast.success('Added to favorites');
    }
  };

  // Share functionality
  const handleShare = async (platform?: string) => {
    if (!product) return;

    const productUrl = `${window.location.origin}/product/${product._id}`;
    const shareText = `Check out ${product.name} - ${formatPrice(product.price)} on our platform!`;
    
    const shareData = {
      title: product.name,
      text: shareText,
      url: productUrl,
    };

    try {
      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'copy':
          await navigator.clipboard.writeText(productUrl);
          toast.success('Product link copied to clipboard!');
          break;
        default:
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(productUrl);
            toast.success('Product link copied to clipboard!');
          }
          break;
      }
      setShowShareOptions(false);
    } catch (error) {
      console.error('Error sharing:', error);
      if (platform !== 'copy') {
        // Fallback to copy link
        await navigator.clipboard.writeText(productUrl);
        toast.success('Product link copied to clipboard!');
      }
    }
  };

  // Close share options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product?.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const calculateSavings = () => {
    if (!product?.originalPrice || product.originalPrice <= product.price) return 0;
    return product.originalPrice - product.price;
  };

  const whatsappMessage = product 
    ? `Hi! I'm interested in ${product.name} (${formatPrice(product.price)}). Can you tell me more about it?`
    : '';

  const formattedWhatsappNumber = product?.merchant.whatsappNumber 
    ? formatWhatsAppNumber(product.merchant.whatsappNumber)
    : '254712345678';

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !product) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.primaryImage || 'https://via.placeholder.com/800x800?text=No+Image'];
    
    if (isLeftSwipe) {
      // Swipe left - next image
      setSelectedImage(prev => 
        prev < productImages.length - 1 ? prev + 1 : prev
      );
    } else if (isRightSwipe) {
      // Swipe right - previous image
      setSelectedImage(prev => prev > 0 ? prev - 1 : prev);
    }
  };

  const nextImage = () => {
    if (!product) return;
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.primaryImage || 'https://via.placeholder.com/800x800?text=No+Image'];
    
    setSelectedImage(prev => 
      prev < productImages.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    if (!product) return;
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.primaryImage || 'https://via.placeholder.com/800x800?text=No+Image'];
    
    setSelectedImage(prev => 
      prev > 0 ? prev - 1 : productImages.length - 1
    );
  };

  // Auto-scroll gallery to selected image on mobile
  useEffect(() => {
    if (galleryRef.current && window.innerWidth < 768 && product) {
      const gallery = galleryRef.current;
      const selectedThumb = gallery.children[selectedImage];
      if (selectedThumb) {
        gallery.scrollTo({
          left: selectedThumb.offsetLeft - gallery.offsetWidth / 2 + selectedThumb.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedImage, product]);

  // Scroll related products horizontally
  const scrollRelatedProducts = (direction: 'left' | 'right') => {
    if (relatedProductsRef.current) {
      const scrollAmount = 300;
      relatedProductsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <header className="bg-[#FDF8E9] border-b border-orange-100 px-4 py-3 md:py-4">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/products')}
              className="inline-flex items-center text-[#EC5C0A] hover:text-orange-800 hover:underline font-medium text-sm md:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </button>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              <div className="lg:col-span-1 h-64 md:h-80 lg:h-96 bg-gray-200 rounded-xl"></div>
              <div className="lg:col-span-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="lg:col-span-1 h-48 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <header className="bg-[#FDF8E9] border-b border-orange-100 px-4 py-3 md:py-4">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/products')}
              className="inline-flex items-center text-[#EC5C0A] hover:text-orange-800 hover:underline font-medium text-sm md:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </button>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </main>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.primaryImage || 'https://via.placeholder.com/800x800?text=No+Image'];

  return (
    <main className="min-h-screen bg-white">
      {/* SEO-optimized header */}
      <header className="bg-[#FDF8E9] border-b border-orange-100 px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto">
          <nav aria-label="Breadcrumb">
            <button 
              onClick={() => navigate('/products')}
              className="inline-flex items-center text-[#EC5C0A] hover:text-orange-800 hover:underline font-medium text-sm md:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <h1 className="text-xl p-2 pt-0 md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
          {product.name}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          
          {/* Mobile-First Product Gallery with Swipe and Arrows */}
          <section className="lg:col-span-1" aria-label="Product Images">
            <div className="lg:sticky lg:top-4">
              {/* Main Image with Swipe Functionality and Arrows */}
              <div className="relative">
                <div 
                  className="bg-gradient-to-br from-[#FDF8E9] to-orange-100 rounded-xl overflow-hidden mb-3 md:mb-4 shadow-lg relative"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <img
                    src={productImages[selectedImage]}
                    alt={`${product.name} - Main view`}
                    className="w-full h-64 md:h-80 lg:h-96 object-cover"
                    loading="eager"
                  />
                  
                  {/* Swipe Indicators for Mobile */}
                  <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {productImages.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index === selectedImage ? 'bg-[#EC5C0A]' : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Arrow Buttons for Desktop */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="hidden md:flex absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="hidden md:flex absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Thumbnail Gallery - Horizontal Scroll on Mobile */}
              <div 
                ref={galleryRef}
                className="flex overflow-x-auto pb-2 space-x-2 md:grid md:grid-cols-4 md:gap-2 md:space-x-0 hide-scrollbar" 
                role="tablist" 
                aria-label="Product image gallery"
              >
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    role="tab"
                    aria-selected={selectedImage === index}
                    aria-label={`View ${product.name} from angle ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-[#EC5C0A] ring-2 ring-orange-200' : 'border-transparent hover:border-orange-300'
                    }`}
                    style={{ minWidth: '80px' }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-16 md:h-20 object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Product Information - Two Column Grid for Mobile */}
          <article className="lg:col-span-1">
            {/* Product Header */}
            <header className="mb-4 md:mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2 md:gap-3 mb-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <h2 className="text-xl md:text-2xl font-semibold text-orange-500">
                    {product.merchant.businessName} Shop
                  </h2>
                  {product.merchant.verified && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Verified Seller</span>
                      <span className="sm:hidden">Verified</span>
                    </div>
                  )}
                </div>
                <Link
  to={`/business/${product.merchant._id}`}
  className="
    inline-flex items-center gap-1 
    bg-orange-100 text-orange-500 
    hover:bg-orange-500 hover:text-white 
    transition-colors
    px-3 py-1.5 rounded-md 
    text-sm md:text-base whitespace-nowrap
    font-semibold
  "
>
  Visit
  <span className="ml-1">→</span>
</Link>

              </div>
            </header>

            {/* Mobile-Optimized Two Column Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              {/* Enhanced Price Section */}
              <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg md:text-xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                      Save {calculateDiscount()}%
                    </div>
                  )}
                </div>
                
                {/* You Save Statement */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    You save {formatPrice(calculateSavings())}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="bg-gray-50 rounded-lg p-3 flex items-center">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold ml-1">{product.rating || 'N/A'}</span>
                </div>
                <span className="text-xs text-gray-600 ml-1">({product.totalReviews || 0})</span>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-600">Category</span>
                <p className="text-sm font-medium">{product.category}</p>
              </div>

              {/* Description (Full width below price) */}
              <div className="col-span-2 mt-2">
                <h3 className="text-sm font-semibold mb-2 text-gray-900">Description</h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed" style={{ lineHeight: '1.6' }}>
                  {product.description}
                </p>
              </div>
            </div>

            {/* Mobile-Optimized Location */}
            <section className="bg-[#FDF8E9] border border-[#EC5C0A]/30 rounded-lg p-3 md:p-4 mb-4 md:mb-6" aria-label="Shop Location">
              <div className="flex items-start gap-2 md:gap-3">
                <MapPin className="h-4 md:h-5 w-4 md:w-5 text-[#EC5C0A] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-[#EC5C0A] mb-1 text-sm md:text-base">Location</h3>
                  <p className="text-orange-800 text-xs md:text-sm leading-relaxed">
                    {product.merchant.location?.address || product.merchant.location?.city || 'Location not specified'}
                  </p>
                </div>
              </div>
            </section>

            {/* Trust Indicators - Mobile Grid */}
            <section className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6" aria-label="Trust Indicators">
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 p-2 md:p-3 rounded-lg">
                <Shield className="h-3 md:h-4 w-3 md:w-4 text-green-600" />
                <span>Secure Purchase</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 p-2 md:p-3 rounded-lg">
                <Truck className="h-3 md:h-4 w-3 md:w-4 text-[#EC5C0A]" />
                <span>Fast Delivery</span>
              </div>
            </section>
          </article>

          {/* Contact & Purchase Section - Mobile Optimized */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              {/* Pricing Card - Mobile First */}
              <section className="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg" aria-label="Product Pricing">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-base md:text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="inline-flex items-center bg-red-100 text-red-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                      🔥 Save {calculateDiscount()}% Today!
                    </div>
                  )}
                </div>

                {/* WhatsApp CTA - Fixed Number Format */}
                <Button
                  className="w-full bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold py-3 md:py-4 text-sm md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-3"
                  size="lg"
                  asChild
                >
                  <a 
                    href={`https://wa.me/${formattedWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Chat about ${product.name} on WhatsApp`}
                  >
                    💬 Chat on WhatsApp
                  </a>
                </Button>

                {/* Share Button */}
                <div className="relative mb-3" ref={shareRef}>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-blue-200 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-medium py-2 md:py-3 text-sm md:text-base"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    aria-label="Share product"
                  >
                    <Share2 className="h-4 md:h-5 w-4 md:w-5 mr-2" />
                    Share Product
                  </Button>

                  {/* Share Options Dropdown */}
                  {showShareOptions && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="flex items-center gap-2 p-2 text-sm hover:bg-green-50 rounded-md text-green-600"
                        >
                          <FaWhatsapp className="h-4 w-4" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex items-center gap-2 p-2 text-sm hover:bg-blue-50 rounded-md text-blue-500"
                        >
                          <FaTwitter className="h-4 w-4" />
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex items-center gap-2 p-2 text-sm hover:bg-blue-50 rounded-md text-blue-600"
                        >
                          <span className="text-sm font-bold">f</span>
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="flex items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded-md text-gray-600"
                        >
                          <span className="text-sm">🔗</span>
                          Copy Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-2 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-medium py-2 md:py-3 text-sm md:text-base"
                  onClick={toggleFavorite}
                  aria-label={`Add ${product.name} to wishlist`}
                >
                  <Heart className={`h-4 md:h-5 w-4 md:w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </section>

              {/* Enhanced Seller Contact Card */}
              <section className="bg-gradient-to-br from-[#FDF8E9] to-orange-50 border border-[#EC5C0A]/30 rounded-xl p-4 md:p-6 shadow-lg" aria-label="Seller Contact Information">
                <header className="text-center mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Contact Seller Directly</h3>
                  <p className="text-xs md:text-sm text-gray-600">Get instant responses & negotiate prices</p>
                </header>

                {/* Contact Methods - Mobile Optimized */}
                <div className="space-y-2 md:space-y-3 mb-4">
                  {product.merchant.phone && (
                    <a 
                      href={`tel:${product.merchant.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      aria-label={`Call seller at ${product.merchant.phone}`}
                    >
                      <div className="bg-[#FDF8E9] p-2 rounded-full border border-[#EC5C0A]/30">
                        <Phone className="h-3 md:h-4 w-3 md:w-4 text-[#EC5C0A]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base">Call Now</p>
                        <p className="text-xs md:text-sm text-gray-600">{product.merchant.phone}</p>
                      </div>
                    </a>
                  )}

                  {product.merchant.email && (
                    <a 
                      href={`mailto:${product.merchant.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      aria-label={`Email seller at ${product.merchant.email}`}
                    >
                      <div className="bg-red-100 p-2 rounded-full">
                        <Mail className="h-3 md:h-4 w-3 md:w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base">Email</p>
                        <p className="text-xs md:text-sm text-gray-600">{product.merchant.email}</p>
                      </div>
                    </a>
                  )}
                </div>

                {/* Social Media Links */}
                <div className="border-t pt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-3 text-center">Follow on Social Media:</p>
                  <div className="flex gap-3 justify-center">
                    <a 
                      href={`https://wa.me/${formattedWhatsappNumber}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-100 p-2 md:p-3 rounded-full hover:bg-green-200 transition-colors"
                      aria-label="WhatsApp"
                    >
                      <FaWhatsapp className="h-4 md:h-5 w-4 md:w-5 text-[#25D366]" />
                    </a>
                    <a 
                      href="https://twitter.com/seller" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-100 p-2 md:p-3 rounded-full hover:bg-blue-200 transition-colors"
                      aria-label="Twitter"
                    >
                      <FaTwitter className="h-4 md:h-5 w-4 md:w-5 text-blue-500" />
                    </a>
                    <a 
                      href="https://instagram.com/seller" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-pink-100 p-2 md:p-3 rounded-full hover:bg-pink-200 transition-colors"
                      aria-label="Instagram"
                    >
                      <FaInstagram className="h-4 md:h-5 w-4 md:w-5 text-pink-500" />
                    </a>
                  </div>
                </div>

                {/* Quick Stats - Mobile Responsive */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <Users className="h-3 md:h-4 w-3 md:w-4" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">500+</p>
                      <p className="text-gray-600 text-xs">Happy Customers</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[#EC5C0A] mb-1">
                        <Clock className="h-3 md:h-4 w-3 md:w-4" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">24/7</p>
                      <p className="text-gray-600 text-xs">Support</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <Star className="h-3 md:h-4 w-3 md:w-4" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">4.8★</p>
                      <p className="text-gray-600 text-xs">Rating</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>

        {/* Recently Viewed & Most Viewed Tabs */}
        {/* <section className="mt-8 md:mt-12" aria-label="Product Recommendations">
          <Tabs defaultValue="recently-viewed" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="recently-viewed" className="data-[state=active]:bg-[#FDF8E9] data-[state=active]:text-[#EC5C0A]">
                Recently Viewed
              </TabsTrigger>
              <TabsTrigger value="most-viewed" className="data-[state=active]:bg-[#FDF8E9] data-[state=active]:text-[#EC5C0A]">
                Most Viewed
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recently-viewed">
              <div className="recently-viewed-container grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {recentlyViewedProducts.length > 0 ? (
                  recentlyViewedProducts.map(product => (
                    <div key={product._id} className="recently-viewed-product bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={product.images?.[0] || product.primaryImage || 'https://via.placeholder.com/400x400?text=No+Image'} 
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</p>
                        <p className="text-sm font-bold text-green-600">{formatPrice(product.price)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <p>No recently viewed products</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="most-viewed">
              <div className="most-viewed-container grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {mostViewedProducts.length > 0 ? (
                  mostViewedProducts.map(product => (
                    <div key={product._id} className="most-viewed-product bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={product.images?.[0] || product.primaryImage || 'https://via.placeholder.com/400x400?text=No+Image'} 
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</p>
                        <p className="text-sm font-bold text-green-600">{formatPrice(product.price)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <p>No most viewed products</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section> */}

        {/* Customer Reviews Section */}
        <section className="mt-8 md:mt-16" aria-label="Customer Reviews">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {reviews.map((review) => (
                <article key={review._id} className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-[#FDF8E9] p-2 rounded-full border border-[#EC5C0A]/30">
                      <Users className="h-3 md:h-4 w-3 md:w-4 text-[#EC5C0A]" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{review.user.name}</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{review.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg">
              <Users className="h-8 md:h-12 w-8 md:w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm md:text-base">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </section>

        {/* Enhanced Related Products with Horizontal Scroll Carousel */}
        <section className="mt-8 md:mt-16" aria-label="Related Products">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">More in {product.category}</h2>
            
            {/* Navigation Arrows for Desktop */}
            {relatedProducts.length > 0 && (
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scrollRelatedProducts('left')}
                  className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scrollRelatedProducts('right')}
                  className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            {/* Horizontal Scroll Container */}
            <div
              ref={relatedProductsRef}
              className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedProducts.length > 0 ? (
                relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="flex-shrink-0 w-48 md:w-56 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      navigate(`/product/${relatedProduct._id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.images?.[0] || relatedProduct.primaryImage || 'https://via.placeholder.com/400x400?text=No+Image'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">{relatedProduct.name}</p>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-green-600">{formatPrice(relatedProduct.price)}</p>
                        {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                          <>
                            <p className="text-xs text-gray-400 line-through">{formatPrice(relatedProduct.originalPrice)}</p>
                            <p className="text-xs text-green-600 font-medium">
                              Save {formatPrice(relatedProduct.originalPrice - relatedProduct.price)}
                            </p>
                          </>
                        )}
                      </div>
                      
                      {/* Merchant Info */}
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-gray-600 truncate">
                          {typeof relatedProduct.merchant === 'object' 
                            ? relatedProduct.merchant?.businessName 
                            : 'Unknown Merchant'
                          }
                        </span>
                        {relatedProduct.merchant?.verified && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium text-gray-900">{relatedProduct.rating || 'N/A'}</span>
                        <span className="text-xs text-gray-600">({relatedProduct.totalReviews || 0})</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-500">
                  <p>No related products found in {product.category}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Add the responsive CSS */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Reduce product display size by 50% for desktop */
        @media (min-width: 768px) {
          .recently-viewed-product,
          .most-viewed-product {
            transform: scale(0.5);
            transform-origin: top left;
            width: 200% !important;
            height: 200% !important;
          }
          
          .recently-viewed-container,
          .most-viewed-container {
            height: 250px !important;
            overflow: hidden;
          }
        }

        /* Mobile layout adjustments */
        @media (max-width: 767px) {
          .contact-buttons-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            align-items: stretch;
          }
          
          .contact-buttons-container > * {
            height: 100%;
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .location-container {
            grid-column: 1 / span 2;
            margin-top: 12px;
          }
        }
      `}</style>
    </main>
  );
};

export default ProductDetail;