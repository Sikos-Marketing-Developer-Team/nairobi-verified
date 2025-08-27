import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart, ArrowLeft, Phone, Mail, Shield, Truck, Clock, Users, Image } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaTwitter } from 'react-icons/fa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import './product.css'

// Mock products data with complete information
const products = [
  {
    id: 1,
    name: "Premium Wireless Bluetooth Headphones",
    price: 8500,
    originalPrice: 12000,
    merchant: "TechHub Kenya",
    category: "Electronics",
    rating: 4.8,
    reviews: 156,
    verified: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop"
    ],
    shopLocation: "Sarit Centre, Westlands, Nairobi, Kenya",
    description: "Experience premium sound quality with these wireless Bluetooth headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort padding. Perfect for music lovers and professionals who demand the best audio experience.",
    customerReviews: [
      {
        user: "John Kamau",
        comment: "Excellent sound quality and very comfortable to wear for long periods. Battery life is amazing!"
      },
      {
        user: "Mary Wanjiku",
        comment: "Best headphones I've ever owned. The noise cancellation works perfectly in busy environments."
      }
    ],
    whatsappNumber: "254712345678",
    phone: "+254 712 345 678",
    email: "techhub@example.com"
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 15000,
    originalPrice: 20000,
    merchant: "FitTech Store",
    category: "Electronics",
    rating: 4.6,
    reviews: 89,
    verified: true,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop"
    ],
    shopLocation: "Village Market, Gigiri, Nairobi, Kenya",
    description: "Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life. Track your fitness goals with precision.",
    customerReviews: [
      {
        user: "David Mwangi",
        comment: "Great fitness tracking features. Very accurate and easy to use."
      }
    ],
    whatsappNumber: "254723456789",
    phone: "+254 723 456 789",
    email: "fittech@example.com"
  }
];

// Mock data for recently viewed and most viewed products
const recentlyViewedProducts = [
  products[1],
  {
    id: 3,
    name: "Wireless Earbuds",
    price: 4500,
    originalPrice: 6000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    category: "Electronics"
  },
  {
    id: 4,
    name: "Smartphone Stand",
    price: 1200,
    image: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=400&fit=crop",
    category: "Accessories"
  }
];

const mostViewedProducts = [
  {
    id: 5,
    name: "Laptop Backpack",
    price: 2800,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "Accessories"
  },
  {
    id: 6,
    name: "Wireless Charger",
    price: 2200,
    image: "https://images.unsplash.com/photo-1583863788438-ec5b8deef2f1?w=400&h=400&fit=crop",
    category: "Electronics"
  },
  products[0]
];

const ProductPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [activeTab, setActiveTab] = useState("recently-viewed");
  
  const product = selectedProduct;
  const galleryRef = useRef(null);

  // Minimum swipe distance required
  const minSwipeDistance = 50;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = () => {
    if (product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const whatsappMessage = `Hi! I'm interested in ${product.name} (KES ${product.price.toLocaleString()}). Can you tell me more about it?`;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left - next image
      setSelectedImage(prev => 
        prev < (product.gallery?.length || 1) - 1 ? prev + 1 : prev
      );
    } else if (isRightSwipe) {
      // Swipe right - previous image
      setSelectedImage(prev => prev > 0 ? prev - 1 : prev);
    }
  };

  // Auto-scroll gallery to selected image on mobile
  useEffect(() => {
    if (galleryRef.current && window.innerWidth < 768) {
      const gallery = galleryRef.current;
      const selectedThumb = gallery.children[selectedImage];
      if (selectedThumb) {
        gallery.scrollTo({
          left: selectedThumb.offsetLeft - gallery.offsetWidth / 2 + selectedThumb.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedImage]);

  return (
    <main className="min-h-screen bg-white">
      {/* SEO-optimized header */}
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
          
          {/* Mobile-First Product Gallery with Swipe */}
          <section className="lg:col-span-1" aria-label="Product Images">
            <div className="sticky top-4">
              {/* Main Image with Swipe Functionality */}
              <div 
                className="bg-gradient-to-br from-[#FDF8E9] to-orange-100 rounded-xl overflow-hidden mb-3 md:mb-4 shadow-lg relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  src={product.gallery?.[selectedImage] || product.image}
                  alt={`${product.name} - Main view`}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover"
                  loading="eager"
                />
                
                {/* Swipe Indicators for Mobile */}
                <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {product.gallery?.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === selectedImage ? 'bg-[#EC5C0A]' : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Thumbnail Gallery - Horizontal Scroll on Mobile */}
              <div 
                ref={galleryRef}
                className="flex overflow-x-auto pb-2 space-x-2 md:grid md:grid-cols-4 md:gap-2 md:space-x-0 hide-scrollbar" 
                role="tablist" 
                aria-label="Product image gallery"
              >
                {product.gallery?.map((img, index) => (
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
                )) || (
                  // Fallback when no gallery images
                  Array.from({length: 4}, (_, index) => (
                    <div key={index} className="flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200" style={{ minWidth: '80px' }}>
                      <div className="w-full h-16 md:h-20 flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Product Information - Two Column Grid for Mobile */}
          <article className="lg:col-span-1">
            {/* Product Header */}
            <header className="mb-4 md:mb-6">
              <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-3">
                <h2 className="text-base md:text-lg font-medium text-gray-700">{product.merchant}</h2>
                {product.verified && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                    <Check className="h-3 w-3" />
                    <span className="hidden sm:inline">Verified Seller</span>
                    <span className="sm:hidden">Verified</span>
                  </div>
                )}
              </div>
            </header>

            {/* Mobile-Optimized Two Column Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              {/* Price Section */}
              <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg md:text-xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
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
              </div>

              {/* Rating */}
              <div className="bg-gray-50 rounded-lg p-3 flex items-center">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold ml-1">{product.rating}</span>
                </div>
                <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-600">Category</span>
                <p className="text-sm font-medium">{product.category}</p>
              </div>

              {/* Description (Full width below price) */}
              <div className="col-span-2 mt-2">
                <h3 className="text-sm font-semibold mb-1 text-gray-900">Description</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Mobile-Optimized Contact and Location Section */}
            <section className="mb-4 md:mb-6" aria-label="Contact and Location">
              <div className="md:hidden grid grid-cols-2 gap-3 mb-4">
                {/* WhatsApp CTA */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-lg flex flex-col">
                  <Button
                    className="flex-grow bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold py-3 text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    asChild
                  >
                    <a 
                      href={`https://wa.me/${product.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={`Chat about ${product.name} on WhatsApp`}
                    >
                      <FaWhatsapp className="h-5 w-5 mr-2" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                </div>

                {/* Contact Seller */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-lg flex flex-col">
                  <Button 
                    variant="outline" 
                    className="flex-grow border-2 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-medium py-2 text-sm"
                    aria-label={`Add ${product.name} to wishlist`}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Wishlist
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
                      {product.shopLocation}
                    </p>
                  </div>
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

          {/* Contact & Purchase Section - Desktop */}
          <aside className="lg:col-span-1 hidden md:block">
            <div className="sticky top-4">
              {/* Pricing Card */}
              <section className="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg" aria-label="Product Pricing">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
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

                <Button
                  className="w-full bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold py-3 md:py-4 text-sm md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-3"
                  size="lg"
                  asChild
                >
                  <a 
                    href={`https://wa.me/${product.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Chat about ${product.name} on WhatsApp`}
                  >
                    <FaWhatsapp className="h-5 md:h-6 w-5 md:w-6 mr-2 md:mr-3" />
                    💬 Chat on WhatsApp
                  </a>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full border-2 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-medium py-2 md:py-3 text-sm md:text-base"
                  aria-label={`Add ${product.name} to wishlist`}
                >
                  <Heart className="h-4 md:h-5 w-4 md:w-5 mr-2" />
                  Add to Wishlist
                </Button>
              </section>

              {/* Enhanced Seller Contact Card */}
              <section className="bg-gradient-to-br from-[#FDF8E9] to-orange-50 border border-[#EC5C0A]/30 rounded-xl p-4 md:p-6 shadow-lg" aria-label="Seller Contact Information">
                <header className="text-center mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Contact Seller Directly</h3>
                  <p className="text-xs md:text-sm text-gray-600">Get instant responses & negotiate prices</p>
                </header>

                <div className="space-y-2 md:space-y-3 mb-4">
                  <a 
                    href={`tel:${product.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    aria-label={`Call seller at ${product.phone}`}
                  >
                    <div className="bg-[#FDF8E9] p-2 rounded-full border border-[#EC5C0A]/30">
                      <Phone className="h-3 md:h-4 w-3 md:w-4 text-[#EC5C0A]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Call Now</p>
                      <p className="text-xs md:text-sm text-gray-600">{product.phone}</p>
                    </div>
                  </a>

                  <a 
                    href={`mailto:${product.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    aria-label={`Email seller at ${product.email}`}
                  >
                    <div className="bg-red-100 p-2 rounded-full">
                      <Mail className="h-3 md:h-4 w-3 md:w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Email</p>
                      <p className="text-xs md:text-sm text-gray-600">{product.email}</p>
                    </div>
                  </a>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-3 text-center">Follow on Social Media:</p>
                  <div className="flex gap-3 justify-center">
                    <a 
                      href={`https://wa.me/${product.whatsappNumber}`} 
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {recentlyViewedProducts.map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow product-card">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={product.image} 
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
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="most-viewed">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {mostViewedProducts.map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow product-card">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={product.image} 
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
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Customer Reviews Section */}
        <section className="mt-8 md:mt-16" aria-label="Customer Reviews">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">Customer Reviews</h2>
          {product.customerReviews?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {product.customerReviews.map((review, idx) => (
                <article key={idx} className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-[#FDF8E9] p-2 rounded-full border border-[#EC5C0A]/30">
                      <Users className="h-3 md:h-4 w-3 md:w-4 text-[#EC5C0A]" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{review.user}</p>
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

        {/* Related Products */}
        <section className="mt-8 md:mt-16" aria-label="Related Products">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">More in {product.category}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {products.filter(p => p.category === product.category && p.id !== product.id).slice(0,4).map(p => (
              <button 
                key={p.id} 
                onClick={() => {
                  setSelectedProduct(p);
                  setSelectedImage(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block group text-left w-full" 
                aria-label={`View ${p.name}`}
              >
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="mt-2 md:mt-3">
                  <p className="text-xs md:text-sm font-medium text-gray-900 group-hover:text-[#EC5C0A] transition-colors line-clamp-2">{p.name}</p>
                  <p className="text-xs md:text-sm font-semibold text-green-600">{formatPrice(p.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductPage;