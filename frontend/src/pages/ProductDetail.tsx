
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Check, Heart, ShoppingCart, Minus, Plus, Share2, ArrowLeft, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { ProductDetailSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const isLoading = usePageLoading(700);

  // Enhanced mock product data with multiple products
  const products = {
    '1': {
      id: 1,
      name: 'MacBook Pro 16-inch M3',
      price: 185000,
      originalPrice: 250000,
      rating: 4.8,
      reviews: 24,
      images: [
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop'
      ],
      merchant: {
        id: '60d0fe4f5311236168a10101',
        name: 'TechHub Kenya',
        location: 'Kimathi Street, CBD',
        verified: true,
        rating: 4.9,
        totalReviews: 156
      },
      category: 'Electronics',
      inStock: true,
      stockCount: 5,
      description: 'The MacBook Pro 16-inch with M3 chip is Apple\'s most powerful laptop, featuring exceptional performance and efficiency. Perfect for professionals who need top-tier computing power for video editing, software development, and creative work.',
      specifications: [
        'Apple M3 Pro chip with 12-core CPU',
        '18GB unified memory',
        '512GB SSD storage',
        '16-inch Liquid Retina XDR display (3456x2234)',
        'Three Thunderbolt 4 ports',
        'HDMI port, SDXC card slot',
        'MagSafe 3 charging port',
        '22-hour battery life'
      ],
      features: [
        'All-day battery life (up to 22 hours)',
        'Studio-quality three-mic array',
        '1080p FaceTime HD camera',
        'Six-speaker sound system with Spatial Audio',
        'Backlit Magic Keyboard with Touch ID',
        'Force Touch trackpad',
        'Wi-Fi 6E and Bluetooth 5.3'
      ],
      tags: ['Professional', 'Creative', 'High Performance', 'Apple']
    },
    '2': {
      id: 2,
      name: 'Samsung Galaxy S24 Ultra',
      price: 120000,
      originalPrice: 150000,
      rating: 4.7,
      reviews: 32,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop'
      ],
      merchant: {
        id: '60d0fe4f5311236168a10102',
        name: 'Mobile World CBD',
        location: 'Tom Mboya Street, CBD',
        verified: true,
        rating: 4.8,
        totalReviews: 89
      },
      category: 'Electronics',
      inStock: true,
      stockCount: 12,
      description: 'The Samsung Galaxy S24 Ultra represents the pinnacle of Android smartphone technology. With its advanced camera system, S Pen functionality, and powerful performance, it\'s perfect for productivity and creativity.',
      specifications: [
        'Snapdragon 8 Gen 3 processor',
        '12GB RAM, 256GB storage',
        '6.8-inch Dynamic AMOLED 2X display',
        '200MP main camera with AI enhancement',
        '12MP ultrawide, 10MP telephoto cameras',
        '5000mAh battery with 45W fast charging',
        'Built-in S Pen',
        'IP68 water resistance'
      ],
      features: [
        'Advanced AI photography',
        'S Pen for note-taking and drawing',
        'All-day battery life',
        'Ultra-fast 5G connectivity',
        'Samsung DeX desktop experience',
        'Wireless charging and PowerShare',
        'Knox security platform'
      ],
      tags: ['Flagship', 'Camera', 'S Pen', 'Android']
    },
    '3': {
      id: 3,
      name: 'Designer Leather Handbag',
      price: 8500,
      originalPrice: 15000,
      rating: 4.4,
      reviews: 18,
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop'
      ],
      merchant: {
        id: '60d0fe4f5311236168a10106',
        name: 'Fashion House CBD',
        location: 'River Road, CBD',
        verified: true,
        rating: 4.6,
        totalReviews: 67
      },
      category: 'Fashion',
      inStock: true,
      stockCount: 8,
      description: 'Elegant designer leather handbag crafted from premium genuine leather. Perfect for both professional and casual occasions, featuring multiple compartments and a timeless design.',
      specifications: [
        '100% Genuine leather construction',
        'Dimensions: 35cm x 25cm x 15cm',
        'Multiple interior compartments',
        'Adjustable shoulder strap',
        'Gold-tone hardware',
        'Magnetic snap closure',
        'Interior zip pocket',
        'Dust bag included'
      ],
      features: [
        'Premium genuine leather',
        'Spacious interior design',
        'Multiple organization pockets',
        'Comfortable shoulder strap',
        'Elegant gold hardware',
        'Professional craftsmanship',
        'Versatile styling options'
      ],
      tags: ['Designer', 'Leather', 'Elegant', 'Professional']
    }
  };

  const product = products[id as keyof typeof products] || products['1'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity);
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category.toLowerCase()}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
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
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => setIsImageZoomed(true)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {product.originalPrice > product.price && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white font-bold">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{product.rating}</span>
                  <span className="text-gray-500 ml-1">({product.reviews} reviews)</span>
                </div>
                <span className="text-gray-300">|</span>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
              
              {/* Product Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Merchant Info */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link 
                        to={`/merchant/${product.merchant.id}`}
                        className="font-semibold text-lg hover:text-primary transition-colors"
                      >
                        {product.merchant.name}
                      </Link>
                      {product.merchant.verified && (
                        <div className="verified-badge">
                          <Check className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      {product.merchant.location}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-medium">{product.merchant.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({product.merchant.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link to={`/merchant/${product.merchant.id}`}>
                      <Button variant="outline" size="sm">
                        View Store
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.originalPrice > product.price && (
                <span className="text-green-600 font-medium">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock ? `In Stock (${product.stockCount} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockCount}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary hover:bg-primary-dark"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
                <h3 className="text-xl font-semibold mt-6 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Reviews functionality coming soon...</p>
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
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setIsImageZoomed(false)}
            >
              ✕
            </Button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`w-3 h-3 rounded-full ${
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
