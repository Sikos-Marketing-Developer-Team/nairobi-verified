// ProductPage.jsx
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart, ArrowLeft } from 'lucide-react';
import { products } from '@/data/products';

const ProductPage = () => {
  const { id } = useParams();
  
  // In a real app, you would fetch product data based on ID
  // For now, we'll use the same products array
  const product = products.find(p => p.id === parseInt(id));
  
  if (!product) {
    return <div>Product not found</div>;
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to products
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover"
          />
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">{product.merchant}</span>
            {product.verified && (
              <div className="verified-badge">
                <Check className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
          
          <Link to={`/merchant/${product.merchantId}`} className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{product.location}</span>
          </Link>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.category}</span>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {calculateDiscount() > 0 && (
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                  Save {calculateDiscount()}%
                </span>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">
              This is a detailed description of the product. In a real application, 
              this would come from your product data. It would include all the features, 
              specifications, and benefits of the product.
            </p>
          </div>
          
          <Button className="w-full bg-primary hover:bg-primary-dark text-white mb-4" size="lg">
            Add to Cart
          </Button>
          
          <Button variant="outline" className="w-full" size="lg">
            <Heart className="h-5 w-5 mr-2" />
            Add to Wishlist
          </Button>
        </div>
      </div>
      
      {/* Product Details Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Product Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <ul className="space-y-2">
              <li className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Brand</span>
                <span className="font-medium">Brand Name</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Model</span>
                <span className="font-medium">Model Number</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="text-gray-600">SKU</span>
                <span className="font-medium">SKU-12345</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{product.category}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Shipping & Returns</h3>
            <ul className="space-y-2">
              <li className="flex items-start border-b pb-2">
                <span className="text-gray-600 mr-2">•</span>
                <span>Free shipping within Nairobi</span>
              </li>
              <li className="flex items-start border-b pb-2">
                <span className="text-gray-600 mr-2">•</span>
                <span>Delivery in 2-3 business days</span>
              </li>
              <li className="flex items-start border-b pb-2">
                <span className="text-gray-600 mr-2">•</span>
                <span>30-day return policy</span>
              </li>
              <li className="flex items-start border-b pb-2">
                <span className="text-gray-600 mr-2">•</span>
                <span>Warranty included</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;