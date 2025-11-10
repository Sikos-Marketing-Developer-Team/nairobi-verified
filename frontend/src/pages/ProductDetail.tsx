import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Check, Heart, Share2, ArrowLeft, ZoomIn, AlertCircle, Phone, Mail, Shield, Clock } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { ProductDetailSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
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

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productsAPI.getProduct(id!);
      
      if (response.data.success) {
        setProduct(response.data.data || response.data.product);
        
        // Check if product is in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(id));
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
      toast.error('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  const loadReviews = useCallback(async () => {
    if (!product?.merchant._id) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await reviewsAPI.getReviews(product.merchant._id);
      if (response.data.success) {
        setReviews(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [product?.merchant._id]);

  useEffect(() => {
    if (product?.merchant._id) {
      loadReviews();
    }
  }, [product?.merchant._id, loadReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;
    
    if (reviewForm.comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    try {
      const response = await reviewsAPI.addReview(product.merchant._id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      });

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setReviewForm({ rating: 5, comment: '' });
        setShowReviewForm(false);
        loadReviews();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review. Please login and try again.');
    }
  };

  // Favorite functionality
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

    const shareUrl = window.location.href;
    const shareText = `Check out ${product.name} - ${formatPrice(product.price)} on our platform!`;
    const shareImage = product.images?.[0] || product.primaryImage;

    try {
      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
          break;
        
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
          break;
        
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
          break;
        
        default:
          // Native share API
          if (navigator.share) {
            await navigator.share({
              title: product.name,
              text: shareText,
              url: shareUrl,
            });
          } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard!');
          }
          break;
      }
      
      setShowShareOptions(false);
      toast.success('Product shared successfully!');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share product');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const whatsappMessage = product 
    ? `Hi! I'm interested in ${product.name} (${formatPrice(product.price)}). Can you tell me more about it?`
    : '';

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: `Reviews ${reviews.length > 0 ? `(${reviews.length})` : ''}` }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        <PageSkeleton>
          <ProductDetailSkeleton />
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/products')} className="bg-orange-600 hover:bg-orange-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.primaryImage || 'https://via.placeholder.com/800x800?text=No+Image'];

  const specifications = typeof product.specifications === 'object' && product.specifications !== null
    ? Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`)
    : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link to="/" className="hover:text-orange-600 transition-colors duration-200">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-orange-600 transition-colors duration-200">Products</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Products
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                onClick={() => setIsImageZoomed(true)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsImageZoomed(true)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-2 py-1 shadow-lg">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
              {productImages.slice(0, 6).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index 
                      ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 break-words leading-tight">
                {product.name}
              </h1>
              
              {/* Rating and Category */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                {product.rating && (
                  <div className="flex items-center bg-orange-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 fill-current" />
                    <span className="ml-1 font-semibold text-orange-800">{product.rating}</span>
                    {product.totalReviews && (
                      <span className="text-orange-600 ml-1 text-sm">({product.totalReviews})</span>
                    )}
                  </div>
                )}
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {product.category}
                </Badge>
              </div>
              
              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-green-600 font-semibold text-lg">
                    You save {formatPrice(product.originalPrice - product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* WhatsApp Inquiry Button */}
              <a
                href={`https://wa.me/${product.merchant.whatsappNumber || '254712345678'}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                  <FaWhatsapp className="h-5 w-5 mr-2" />
                  Inquire via WhatsApp
                </Button>
              </a>
              
              {/* Favorite Button */}
              <Button 
                variant="outline" 
                size="lg" 
                className={`sm:w-12 h-12 border-gray-300 transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400' 
                    : 'hover:border-orange-400 hover:text-orange-600'
                }`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              
              {/* Share Button with Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="sm:w-12 h-12 border-gray-300 hover:border-orange-400 hover:text-orange-600"
                  onClick={() => setShowShareOptions(!showShareOptions)}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                
                {/* Share Options Dropdown */}
                {showShareOptions && (
                  <div className="absolute top-14 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[180px] p-2">
                    <div className="space-y-1">
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
                      >
                        <FaWhatsapp className="h-4 w-4 text-green-500" />
                        Share on WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                      >
                        <span className="w-4 h-4 bg-blue-500 text-white text-xs flex items-center justify-center rounded">f</span>
                        Share on Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors"
                      >
                        <span className="w-4 h-4 bg-blue-400 text-white text-xs flex items-center justify-center rounded">𝕏</span>
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                      >
                        <span className="w-4 h-4 border border-gray-400 text-gray-600 text-xs flex items-center justify-center rounded">📋</span>
                        Copy Link
                      </button>
                      {navigator.share && (
                        <button
                          onClick={() => handleShare()}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                          Share via...
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="flex flex-col items-center text-center p-3 bg-orange-50 rounded-xl border border-orange-100 w-full">
                <Shield className="h-5 w-5 text-orange-600 mb-1" />
                <span className="text-xs font-medium text-orange-700">Secure</span>
              </div>
              
              <div className="flex flex-col items-center text-center p-3 bg-orange-50 rounded-xl border border-orange-100 w-full">
                <Clock className="h-5 w-5 text-orange-600 mb-1" />
                <span className="text-xs font-medium text-orange-700">24/7 Support</span>
              </div>
              
              <div className="flex flex-col items-center text-center p-3 bg-orange-50 rounded-xl border border-orange-100 w-full">
                <Check className="h-5 w-5 text-orange-600 mb-1" />
                <span className="text-xs font-medium text-orange-700">Verified</span>
              </div>
            </div>

            {/* Merchant Info */}
            <Card className="border border-gray-200 hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {product.merchant.businessName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <Link 
                          to={`/business/${product.merchant._id}`}
                          className="font-bold text-gray-900 hover:text-orange-600 transition-colors truncate block text-base"
                        >
                          {product.merchant.businessName}
                        </Link>
                        <div className="flex items-center gap-2">
                          {product.merchant.verified && (
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border-orange-200">
                              <Check className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                          {product.merchant.rating && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="h-3 w-3 text-orange-400 fill-current mr-1" />
                              <span className="font-medium">{product.merchant.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {product.merchant.location && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words">
                          {product.merchant.location.address || product.merchant.location.city || 'Nairobi CBD'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="sm:ml-4 flex-shrink-0">
                    <Link to={`/business/${product.merchant._id}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto border-gray-300 hover:border-orange-400 hover:text-orange-600">
                        View Store
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="border border-gray-200 rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Contact Seller</h3>
                <div className="space-y-3">
                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/${product.merchant.whatsappNumber || '254712345678'}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button 
                      className="w-full bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold py-3.5 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <FaWhatsapp className="h-5 w-5 mr-2" />
                      💬 Chat on WhatsApp
                    </Button>
                  </a>

                  {/* Contact Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.merchant.phone && (
                      <a
                        href={`tel:${product.merchant.phone}`}
                        className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-200 border border-orange-200"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-orange-600">Call us</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{product.merchant.phone}</p>
                        </div>
                      </a>
                    )}

                    {product.merchant.email && (
                      <a
                        href={`mailto:${product.merchant.email}`}
                        className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-200 border border-orange-200"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-orange-600">Email us</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{product.merchant.email}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 sm:mt-16">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 min-w-max px-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-6 sm:py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed break-words mb-6">
                  {product.description}
                </p>
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-6">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).slice(0, 6).map(([key, value], index) => (
                        <div key={index} className="flex items-start p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <Check className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base break-words">{key}</span>
                            <span className="text-gray-600 text-sm sm:text-base block mt-1 break-words">{String(value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <div key={index} className="flex flex-col p-4 sm:p-5 bg-orange-50 rounded-xl border border-orange-200 hover:shadow-sm transition-shadow duration-200">
                        <span className="font-semibold text-gray-700 mb-2 text-sm sm:text-base break-words">{key}</span>
                        <span className="text-gray-600 text-sm sm:text-base break-words">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-base">No specifications available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Reviews</h3>
                    <p className="text-gray-600 mt-2">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </Button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <Card className="border border-gray-200 mb-8 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="focus:outline-none transform hover:scale-110 transition-transform duration-200"
                              >
                                <Star
                                  className={`h-8 w-8 sm:h-10 sm:w-10 ${
                                    star <= reviewForm.rating
                                      ? 'text-orange-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Your Review
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base resize-none transition-colors duration-200"
                            rows={5}
                            placeholder="Share your experience with this product..."
                            required
                            minLength={10}
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Minimum 10 characters
                          </p>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6"
                        >
                          Submit Review
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Reviews List */}
                {isLoadingReviews ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  </div>
                ) : reviews.length === 0 ? (
                  <Card className="border border-gray-200 rounded-2xl overflow-hidden">
                    <CardContent className="p-12 text-center">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        No reviews yet. Be the first to review this product!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <Card key={review._id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">
                                  {review.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-gray-900 text-base truncate">
                                  {review.user.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? 'text-orange-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 text-base leading-relaxed break-words">
                            {review.comment}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isImageZoomed && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <img
              src={productImages[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              onClick={() => setIsImageZoomed(false)}
            >
              ✕
            </Button>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    selectedImage === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ProductDetail;