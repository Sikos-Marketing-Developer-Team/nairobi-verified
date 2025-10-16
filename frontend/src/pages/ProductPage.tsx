import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Bookmark, ArrowLeft, Phone, Mail, Shield, Truck, Clock, Users, Image, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTwitter } from 'react-icons/fa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { merchantsAPI, productsAPI } from '@/lib/api';
import { Merchant, Product as ProductType } from '@/types';
import './product.css'

// Type guard to check if merchant is an object
const isMerchantObject = (merchant: string | Merchant): merchant is Merchant => {
  return typeof merchant === 'object' && merchant !== null && '_id' in merchant;
};

// Helper function to get merchant ID
const getMerchantId = (merchant: string | Merchant): string => {
  return isMerchantObject(merchant) ? merchant._id : merchant;
};

// Helper function to get merchant business name
const getMerchantName = (merchant: string | Merchant): string => {
  return isMerchantObject(merchant) ? merchant.businessName : 'Unknown Merchant';
};

// Helper function to get merchant contact info
const getMerchantContact = (merchant: string | Merchant) => {
  if (isMerchantObject(merchant)) {
    return {
      phone: merchant.phone || merchant.contact?.phone || '+254712345678',
      email: merchant.email || merchant.contact?.email || 'contact@example.com',
      address: merchant.address || 'Nairobi, Kenya'
    };
  }
  return {
    phone: '+254712345678',
    email: 'contact@example.com',
    address: 'Nairobi, Kenya'
  };
};

// Wishlist hook
const useWishlist = () => {
  const [wishlist, setWishlist] = useState<ProductType[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: ProductType) => {
    setWishlist(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(item => item._id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item._id === productId);
  };

  const toggleWishlist = (product: ProductType) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist
  };
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("recently-viewed");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ProductType[]>([]);
  
  const galleryRef = useRef<HTMLDivElement>(null);

  const { isInWishlist, toggleWishlist } = useWishlist();

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          throw new Error('Product ID not found');
        }

        // Fetch the main product
        const productResponse = await productsAPI.getProduct(id);
        const productData: ProductType = productResponse.data.data;
        setProduct(productData);

        // Fetch related products from the same category
        if (productData.category) {
          const relatedResponse = await productsAPI.getProducts({
            category: productData.category,
            limit: 4
          });
          setRelatedProducts(relatedResponse.data.data.filter((p: ProductType) => p._id !== id));
        }

        // Fetch merchants data
        const merchantsResponse = await merchantsAPI.getMerchants();
        setMerchants(merchantsResponse.data.data);

      } catch (err) {
        setError('Failed to load product data');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Find the current merchant for the selected product
  const currentMerchant = product?.merchant 
    ? (isMerchantObject(product.merchant) 
        ? product.merchant 
        : merchants.find(merchant => merchant._id === product.merchant))
    : undefined;

  // Get merchant info with fallbacks
  const merchantInfo = {
    id: currentMerchant?._id || (product?.merchant ? getMerchantId(product.merchant) : ''),
    name: currentMerchant?.businessName || (product?.merchant ? getMerchantName(product.merchant) : 'Unknown Merchant'),
    contact: currentMerchant ? getMerchantContact(currentMerchant) : getMerchantContact(''),
    verified: currentMerchant?.verified || false,
    address: currentMerchant?.address || 'Nairobi, Kenya'
  };

  // Load recently viewed from localStorage
  useEffect(() => {
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    }
  }, []);

  // Save product to recently viewed when it loads
  useEffect(() => {
    if (product) {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updatedRecentlyViewed = [
        product,
        ...recentlyViewed.filter((p: ProductType) => p._id !== product._id)
      ].slice(0, 5);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecentlyViewed));
      setRecentlyViewed(updatedRecentlyViewed);
    }
  }, [product]);

  const minSwipeDistance = 50;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (product: ProductType) => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const getWhatsappMessage = (product: ProductType) => {
    return `Hi! I'm interested in ${product.name} (KES ${product.price?.toLocaleString()}). Can you tell me more about it?`;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !product) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setSelectedImage(prev => 
        prev < (product.gallery?.length || 1) - 1 ? prev + 1 : prev
      );
    } else if (isRightSwipe) {
      setSelectedImage(prev => prev > 0 ? prev - 1 : prev);
    }
  };

  // Auto-scroll gallery to selected image on mobile
  useEffect(() => {
    if (galleryRef.current && window.innerWidth < 768) {
      const gallery = galleryRef.current;
      const selectedThumb = gallery.children[selectedImage];
      if (selectedThumb) {
        const thumb = selectedThumb as HTMLElement;
        gallery.scrollTo({
          left: thumb.offsetLeft - gallery.offsetWidth / 2 + thumb.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedImage]);

  const handleWishlistClick = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  // Get product images - fallback to primaryImage if gallery doesn't exist
  const getProductImages = (product: ProductType) => {
    if (product.gallery && product.gallery.length > 0) {
      return product.gallery;
    }
    return product.primaryImage ? [product.primaryImage] : ['/placeholder-image.jpg'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC5C0A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product information...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Product not found'}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#EC5C0A] hover:bg-orange-700"
          >
            Retry
          </Button>
          <Link to="/products">
            <Button variant="outline" className="mt-2 ml-2">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);
  const discount = calculateDiscount(product);

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-[#FDF8E9] border-b border-orange-100 px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto">
          <nav aria-label="Breadcrumb">
            <button 
              onClick={() => window.history.back()}
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
          
          {/* Product Gallery */}
          <section className="lg:col-span-1" aria-label="Product Images">
            <div className="sticky top-4">
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
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === 0 ? productImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-[#FEF8EB] text-[#EC5C0A] p-3 rounded-full shadow-lg hover:bg-black transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === productImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-[#FEF8EB] text-[#EC5C0A] p-3 rounded-full shadow-lg hover:bg-black transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

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
              </div>

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

          {/* Product Information */}
          <article className="lg:col-span-1">
            <header className="mb-4 md:mb-6">
              <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-3">
                <h2 className="text-base md:text-lg font-medium text-gray-700">
                  {merchantInfo.name}
                </h2>
                {merchantInfo.verified && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                    <Check className="h-3 w-3" />
                    <span className="hidden sm:inline">Verified Seller</span>
                    <span className="sm:hidden">Verified</span>
                  </div>
                )}
              </div>
            </header>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              {/* Price Section */}
              <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg md:text-xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                      Save {discount}%
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="bg-gray-50 rounded-lg p-3 flex items-center">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold ml-1">{product.rating || 0}</span>
                </div>
                <span className="text-xs text-gray-600 ml-1">({product.reviewCount || 0})</span>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-600">Category</span>
                <p className="text-sm font-medium">{product.category}</p>
              </div>

              {/* Description */}
              <div className="col-span-2 mt-2 flex flex-col">
                <h3 className="text-sm font-semibold mb-1 text-gray-900">
                  Description
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* View My Shop CTA Button */}
              <div className="col-span-2 mt-3">
                <Link to={`/merchant/${merchantInfo.id}`}>
                  <Button className="w-full bg-[#FDF8E9] hover:bg-[#EC5C0A] text-[#EC5C0A] hover:text-white border-2 border-[#EC5C0A] font-semibold py-3 text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md">
                    <Store className="h-4 w-4 mr-2" />
                    View My Shop
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Contact Section */}
            <section className="mb-4 md:mb-6" aria-label="Contact and Location">
              <div className="md:hidden grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg flex flex-col">
                  <Button
                    className="flex-grow bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold py-2 px-3 text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    asChild
                  >
                    <a 
                      href={`https://wa.me/${merchantInfo.contact.phone}?text=${encodeURIComponent(getWhatsappMessage(product))}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={`Chat about ${product.name} on WhatsApp`}
                    >
                      <FaWhatsapp className="h-4 w-4 mr-1" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg flex flex-col">
                  <Button 
                    variant="outline" 
                    className={`flex-grow border-2 font-medium py-2 px-3 text-xs sm:text-sm flex items-center justify-center transition-all duration-300 ${
                      isInWishlist(product._id) 
                        ? 'bg-green-50 border-green-300 text-green-600 hover:bg-green-100' 
                        : 'border-green-200 hover:bg-green-50 text-green-600 hover:text-green-700'
                    }`}
                    onClick={handleWishlistClick}
                    aria-label={`${isInWishlist(product._id) ? 'Remove from' : 'Add to'} wishlist`}
                  >
                    <Bookmark 
                      className={`h-4 w-4 mr-1 ${isInWishlist(product._id) ? 'fill-green-600' : ''}`} 
                    />
                    {isInWishlist(product._id) ? 'Saved' : 'Wishlist'}
                  </Button>
                </div>
              </div>

              {/* Location */}
              <div className="bg-[#FDF8E9] border border-[#EC5C0A]/30 rounded-lg p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <MapPin className="h-4 md:h-5 w-4 md:w-5 text-[#EC5C0A] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[#EC5C0A] mb-1 text-sm md:text-base">Location</h3>
                    <p className="text-orange-800 text-xs md:text-sm leading-relaxed">
                      {merchantInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust Indicators */}
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

          {/* Desktop Contact Section */}
          <aside className="lg:col-span-1 hidden md:block">
            <div className="sticky top-4">
              {/* Pricing Card */}
              <section className="bg-white border-2 border-[#FDF8E9] rounded-xl p-4 md:p-6 mb-4 md:mb-6 shadow-sm" aria-label="Product Pricing">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
                    <span className="text-2xl md:text-3xl lg:text-3xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-base md:text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="inline-flex items-center bg-red-100 text-red-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                      🔥 Save {discount}% Today!
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold py-3 md:py-4 text-sm md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-3"
                  size="lg"
                  asChild
                >
                  <a 
                    href={`https://wa.me/${merchantInfo.contact.phone}?text=${encodeURIComponent(getWhatsappMessage(product))}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Chat about ${product.name} on WhatsApp`}
                  >
                    💬 Chat on WhatsApp
                  </a>
                </Button>

                <Link to={`/merchant/${merchantInfo.id}`} className="block mb-3">
                  <Button 
                    variant="outline" 
                    className="w-full bg-[#FDF8E9] hover:bg-[#EC5C0A] text-[#EC5C0A] hover:text-white border-2 border-[#EC5C0A] font-semibold py-3 text-sm transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    View My Shop
                  </Button>
                </Link>

                <Button 
                  variant="outline" 
                  className={`w-full border-2 font-medium py-2 md:py-3 text-sm md:text-base transition-all duration-300 ${
                    isInWishlist(product._id) 
                      ? 'bg-green-50 border-green-300 text-green-600 hover:bg-green-100' 
                      : 'border-green-200 hover:bg-green-50 text-green-600 hover:text-green-700'
                  }`}
                  onClick={handleWishlistClick}
                  aria-label={`${isInWishlist(product._id) ? 'Remove from' : 'Add to'} wishlist`}
                >
                  <Bookmark 
                    className={`h-4 w-4 mr-2 ${isInWishlist(product._id) ? 'fill-green-600' : ''}`} 
                  />
                  {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </section>

              {/* Seller Contact Card */}
              <section className="bg-gradient-to-br from-[#FDF8E9] to-orange-50 border border-[#EC5C0A]/30 rounded-xl p-4 md:p-6 shadow-lg" aria-label="Seller Contact Information">
                <header className="text-center mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Contact Seller Directly</h3>
                  <p className="text-xs md:text-sm text-gray-600">Get instant responses & negotiate prices</p>
                </header>

                <div className="space-y-2 md:space-y-3 mb-4">
                  <a 
                    href={`tel:${merchantInfo.contact.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    aria-label={`Call seller at ${merchantInfo.contact.phone}`}
                  >
                    <div className="bg-[#FDF8E9] p-2 rounded-full border border-[#EC5C0A]/30">
                      <Phone className="h-3 md:h-4 w-3 md:w-4 text-[#EC5C0A]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Call Now</p>
                      <p className="text-xs md:text-sm text-gray-600">{merchantInfo.contact.phone}</p>
                    </div>
                  </a>

                  <a 
                    href={`mailto:${merchantInfo.contact.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    aria-label={`Email seller at ${merchantInfo.contact.email}`}
                  >
                    <div className="bg-red-100 p-2 rounded-full">
                      <Mail className="h-3 md:h-4 w-3 md:w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Email</p>
                      <p className="text-xs md:text-sm text-gray-600">{merchantInfo.contact.email}</p>
                    </div>
                  </a>
                </div>
              </section>
            </div>
          </aside>
        </div>

        {/* Product Recommendations */}
        <section className="mt-8 md:mt-12" aria-label="Product Recommendations">
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
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                {recentlyViewed.filter(p => p._id !== product._id).slice(0, 5).map(product => (
                  <Link key={product._id} to={`/product/${product._id}`}>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow product-card cursor-pointer">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={product.primaryImage || '/placeholder-image.jpg'} 
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
                  </Link>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="most-viewed">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                {relatedProducts.slice(0, 5).map(product => (
                  <Link key={product._id} to={`/product/${product._id}`}>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow product-card cursor-pointer">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={product.primaryImage || '/placeholder-image.jpg'} 
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
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        <section className="mt-8 md:mt-16" aria-label="Related Products">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">More in {product.category}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {relatedProducts.map(p => (
              <Link 
                key={p._id} 
                to={`/product/${p._id}`}
                className="block group text-left w-full" 
                aria-label={`View ${p.name}`}
              >
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src={p.primaryImage || '/placeholder-image.jpg'} 
                    alt={p.name} 
                    className="w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="mt-2 md:mt-3">
                  <p className="text-xs md:text-sm font-medium text-gray-900 group-hover:text-[#EC5C0A] transition-colors line-clamp-2">{p.name}</p>
                  <p className="text-xs md:text-sm font-semibold text-green-600">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductPage;