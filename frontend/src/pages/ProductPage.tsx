// ProductPage.jsx
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart, ArrowLeft, Phone, Mail } from 'lucide-react';
import { products } from '@/data/products';
import { FaWhatsapp, FaInstagram, FaTwitter } from 'react-icons/fa';

const ProductPage = () => {
  const { id } = useParams();
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
      {/* Back link */}
      <Link to="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Gallery */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          {/* Mini side-show gallery */}
          <div className="grid grid-cols-4 gap-2">
            {product.gallery?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} angle ${index + 1}`}
                className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">{product.merchant}</span>
            {product.verified && (
              <div className="verified-badge flex items-center gap-1 text-green-600 text-xs">
                <Check className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>

          {/* Shop Location */}
          <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
            <span>{product.shopLocation || "Mid Plaza, Kirinyaga Road, Nairobi, Kenya"}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.category}</span>
          </div>

          {/* Pricing */}
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

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">
              {product.description || "This is a detailed description of the product with features, specifications, and benefits."}
            </p>
          </div>

          {/* Contact Seller */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Seller Contact</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +254 712 345 678</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> seller@email.com</p>
              <div className="flex gap-4 mt-2">
                <a href={`https://wa.me/254712345678`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-600 hover:underline">
                  <FaWhatsapp /> WhatsApp
                </a>
                <a href="https://twitter.com/seller" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                  <FaTwitter /> Twitter
                </a>
                <a href="https://instagram.com/seller" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-pink-500 hover:underline">
                  <FaInstagram /> Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Enquire via WhatsApp */}
          <Button
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            asChild
          >
            <a href={`https://wa.me/254712345678?text=Hi, I'm interested in ${product.name}`} target="_blank" rel="noreferrer">
              <FaWhatsapp className="h-5 w-5 mr-2" />
              Enquire via WhatsApp
            </a>
          </Button>

          <Button variant="outline" className="w-full mt-3" size="lg">
            <Heart className="h-5 w-5 mr-2" />
            Add to Wishlist
          </Button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        {product.customerReviews?.length ? (
          <div className="space-y-4">
            {product.customerReviews.map((review, idx) => (
              <div key={idx} className="border p-4 rounded-lg">
                <p className="font-medium">{review.user}</p>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet.</p>
        )}
      </div>

      {/* More in this Category */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">More in {product.category}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.filter(p => p.category === product.category && p.id !== product.id).slice(0,4).map(p => (
            <Link key={p.id} to={`/product/${p.id}`} className="block">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">{p.name}</p>
              <p className="text-sm text-primary">{formatPrice(p.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
