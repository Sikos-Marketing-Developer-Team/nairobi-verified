import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Check, Heart, ShoppingCart, Minus, Plus, Share2, ArrowLeft, ZoomIn, AlertCircle, Phone, Mail, Shield, Truck } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productsAPI.getProduct(id!);
      
      if (response.data.success) {
        setProduct(response.data.data || response.data.product);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    const newQuantity = quantity + change;
    const maxStock = product.stockQuantity || 999;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const whatsappMessage = product 
    ? `Hi! I'm interested in ${product.name} (${formatPrice(product.price)}). Can you tell me more about it?`
    : '';

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' }
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
            <Button onClick={() => navigate('/products')} className="bg-green-600 hover:bg-green-700">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category.toLowerCase()}`} className="hover:text-primary truncate max-w-[100px]">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setIsImageZoomed(true)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/80 hover:bg-white"
                onClick={() => setIsImageZoomed(true)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                  <Badge className="bg-red-500 text-white font-bold text-xs sm:text-sm">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-gray-200 hover:border-gray-300'
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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 break-words">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                {product.rating && (
                  <>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">{product.rating}</span>
                      {product.totalReviews && (
                        <span className="text-gray-500 ml-1 text-sm">({product.totalReviews} reviews)</span>
                      )}
                    </div>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                  </>
                )}
                <Badge variant="secondary">{product.category}</Badge>
              </div>
              
              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Merchant Info */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link 
                        to={`/business/${product.merchant._id}`}
                        className="font-semibold text-base sm:text-lg hover:text-primary transition-colors truncate"
                      >
                        {product.merchant.businessName}
                      </Link>
                      {product.merchant.verified && (
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs flex-shrink-0">
                          <Check className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {product.merchant.location && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{product.merchant.location.address || product.merchant.location.city || 'Nairobi CBD'}</span>
                      </div>
                    )}
                    {product.merchant.rating && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 font-medium">{product.merchant.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="sm:ml-4">
                    <Link to={`/business/${product.merchant._id}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        View Store
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-3">Contact Seller</h3>
                <div className="space-y-3">
                  {/* WhatsApp Button */}
                  {product.merchant.whatsappNumber && (
                    <a
                      href={`https://wa.me/${product.merchant.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button 
                        className="w-full bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transition-all"
                      >
                        <FaWhatsapp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Chat on WhatsApp
                      </Button>
                    </a>
                  )}

                  {/* Phone */}
                  {product.merchant.phone && (
                    <a
                      href={`tel:${product.merchant.phone}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Call us</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{product.merchant.phone}</p>
                      </div>
                    </a>
                  )}

                  {/* Email */}
                  {product.merchant.email && (
                    <a
                      href={`mailto:${product.merchant.email}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Email us</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{product.merchant.email}</p>
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Secure Purchase</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Fast Delivery</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-green-600 font-medium text-sm sm:text-base">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium text-sm sm:text-base ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock ? `In Stock (${product.stockQuantity || 999} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-medium text-sm sm:text-base">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-3 sm:px-4 py-2 min-w-[2.5rem] sm:min-w-[3rem] text-center text-sm sm:text-base">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stockQuantity || 999)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary hover:bg-primary-dark text-sm sm:text-base"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" className="sm:w-auto">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button variant="outline" size="lg" className="sm:w-auto">
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
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
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
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
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed break-words">{product.description}</p>
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <>
                    <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {Object.entries(product.specifications).slice(0, 5).map(([key, value], index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm sm:text-base break-words"><strong>{key}:</strong> {String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Technical Specifications</h3>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <div key={index} className="flex flex-col p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700 mb-1 text-sm sm:text-base break-words">{key}</span>
                        <span className="text-gray-600 text-sm break-words">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">No specifications available</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm sm:text-base">Reviews functionality coming soon...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isImageZoomed && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative w-full h-full max-w-4xl flex items-center justify-center">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setIsImageZoomed(false)}
            >
              ✕
            </Button>
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    selectedImage === index ? 'bg-white' : 'bg-white/50'
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