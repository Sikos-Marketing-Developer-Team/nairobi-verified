import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart, ArrowLeft, ShoppingCart, Share2, Shield, Truck, RotateCcw } from 'lucide-react';

// Extended product data with detailed descriptions
const productDetails = {
  1: {
    id: 1,
    name: 'MacBook Pro 16-inch M3',
    price: 185000,
    originalPrice: 250000,
    rating: 4.8,
    reviews: 24,
    images: [
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
    ],
    merchant: 'TechHub Kenya',
    location: 'Kimathi Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10101',
    category: 'Electronics',
    sku: 'MPB16M3-001',
    availability: 'In Stock',
    description: 'The MacBook Pro 16-inch with M3 chip delivers exceptional performance for professionals. Featuring a stunning Liquid Retina XDR display, all-day battery life, and the most advanced chip ever built for a personal computer.',
    highlights: [
      'M3 chip with 8-core CPU and 10-core GPU',
      '16.2-inch Liquid Retina XDR display',
      '18-hour battery life',
      '16GB unified memory',
      '512GB SSD storage',
      'Three Thunderbolt 4 ports'
    ],
    specifications: {
      'Processor': 'Apple M3 8-core CPU',
      'Graphics': '10-core GPU',
      'Memory': '16GB unified memory',
      'Storage': '512GB SSD',
      'Display': '16.2-inch Liquid Retina XDR',
      'Resolution': '3456 x 2234 pixels',
      'Battery': 'Up to 18 hours',
      'Weight': '2.16 kg',
      'Dimensions': '35.57 x 24.81 x 1.68 cm'
    }
  },
  4: {
    id: 4,
    name: 'Canon EOS R5 Camera',
    price: 75000,
    originalPrice: 95000,
    rating: 4.9,
    reviews: 15,
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=800&h=600&fit=crop'
    ],
    merchant: 'PhotoPro Kenya',
    location: 'Koinange Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10104',
    category: 'Electronics',
    sku: 'EOSR5-001',
    availability: 'In Stock',
    description: 'The Canon EOS R5 is a groundbreaking full-frame mirrorless camera that delivers exceptional image quality and video performance. Perfect for professional photographers and videographers.',
    highlights: [
      '45-megapixel full-frame CMOS sensor',
      '8K video recording capability',
      'Dual Pixel CMOS AF II autofocus system',
      'In-body image stabilization',
      'Weather-sealed magnesium alloy body',
      'Dual memory card slots (CFexpress/SD)'
    ],
    specifications: {
      'Sensor': '45MP Full-frame CMOS',
      'Video': '8K RAW, 4K 120p',
      'Autofocus': 'Dual Pixel CMOS AF II',
      'ISO Range': '100-51,200 (expandable)',
      'Burst Rate': 'Up to 20 fps (electronic)',
      'Display': '3.2-inch vari-angle touchscreen',
      'Viewfinder': '5.76m-dot OLED EVF',
      'Battery': 'LP-E6NH',
      'Weight': '650g (body only)'
    }
  }
};

const ProductDetailPage = ({ productId = 1 }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const product = productDetails[productId];
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <nav className="text-sm text-gray-600">
            <span>Home</span> / <span>Electronics</span> / <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">{product.merchant}</span>
                {product.verified && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    <Check className="h-3 w-3" />
                    Verified
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {product.location}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-gray-500">({product.reviews} reviews)</span>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Price */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold">
                      -{calculateDiscount()}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">Ex Tax: {formatPrice(product.price)}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">Availability:</span>
                <span className="text-green-600 font-medium">{product.availability}</span>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Warranty</p>
                  <p className="text-xs text-gray-600">1 Year Official</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Truck className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-600">Within Nairobi</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <RotateCcw className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Returns</p>
                  <p className="text-xs text-gray-600">7 Days Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button className="py-4 border-b-2 border-blue-500 text-blue-600 font-medium">
                Description
              </button>
              <button className="py-4 text-gray-500 hover:text-gray-700">
                Specifications
              </button>
              <button className="py-4 text-gray-500 hover:text-gray-700">
                Reviews ({product.reviews})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Description Tab */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Product Overview</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Key Highlights</h3>
                <ul className="space-y-2">
                  {product.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">{key}:</span>
                      <span className="text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;