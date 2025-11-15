import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, MapPin, Check, Phone, Mail, Clock, Heart, ExternalLink, 
  Image as ImageIcon, MessageSquare, AlertCircle, Loader2, X, Send, 
  Facebook, Instagram, Globe, Map, Twitter, Film, Copy, Share2,
  Youtube, Linkedin, ChevronLeft, ChevronRight, Menu,
  Eye, Upload, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewsSection from '@/components/ReviewsSection';
import { merchantsAPI, reviewsAPI, favoritesAPI, productsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePageLoading } from '@/hooks/use-loading';
import { ProductDetailSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '../contexts/FavoritesContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { isBusinessCurrentlyOpen, formatBusinessHours } from '@/utils/businessHours';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

// Type definitions
interface Merchant {
  _id: string;
  businessName: string;
  businessType: string;
  description?: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  whatsappNumber?: string;
  website?: string;
  logo: string;
  bannerImage: string;
  gallery?: string[];
  verified: boolean;
  verifiedDate?: string;
  yearEstablished: number;
  rating: number;
  reviews: number;
  isActive: boolean;
  featured?: boolean;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  googleBusinessUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  whatsapp?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  businessHours?: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  services?: Service[];
}

interface Service {
  name: string;
  description: string;
  price?: string;
}

interface Review {
  _id: string;
  merchant: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  content: string;
  createdAt: string;
  helpful: number;
  helpfulBy: string[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  primaryImage?: string;
  images?: string[];
  category: string;
  stockQuantity: number;
  featured?: boolean;
  merchant: string;
}

// Enhanced social media icon mapping
const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Film,
  youtube: Youtube,
  linkedin: Linkedin,
  website: Globe,
  phone: Phone,
  google: Map,
  whatsapp: Send,
};

const MerchantDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { updateFavoritesCount } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const isPageLoading = usePageLoading(700);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('services');

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // SEO and Data Fetching
  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setLoading(true);
        const merchantRes = await merchantsAPI.getMerchant(id as string);
        const merchantData = merchantRes.data.data;
        setMerchant(merchantData);

        // Update document title and meta tags for SEO
        document.title = `${merchantData.businessName} - ${merchantData.businessType} in ${merchantData.location} | YourPlatform`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 
            `${merchantData.businessName} - ${merchantData.description?.substring(0, 160) || 'Discover this local business'}...`
          );
        }

        // Add Open Graph meta tags
        const ogTags = [
          { property: 'og:title', content: `${merchantData.businessName} - ${merchantData.businessType}` },
          { property: 'og:description', content: merchantData.description?.substring(0, 200) || '' },
          { property: 'og:image', content: merchantData.bannerImage || merchantData.logo },
          { property: 'og:url', content: window.location.href },
          { property: 'og:type', content: 'website' },
        ];
        ogTags.forEach(tag => {
          let meta = document.querySelector(`meta[property="${tag.property}"]`);
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', tag.property);
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', tag.content);
        });

        // Fetch reviews
        const reviewsRes = await reviewsAPI.getReviews(id as string);
        setReviews(reviewsRes.data.data);
        
        // Fetch products for this merchant
        await fetchMerchantProducts(id as string);
        
        setLoading(false);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        setError(err.response?.data?.error || 'Failed to load merchant data');
        setLoading(false);
      }
    };

    if (id) {
      fetchMerchantData();
    } else {
      setError('Merchant ID not provided');
      setLoading(false);
    }
  }, [id]);

  // Fetch merchant products
  const fetchMerchantProducts = async (merchantId: string) => {
    try {
      setProductsLoading(true);
      const response = await productsAPI.getProductsByMerchant(merchantId);
      
      if (response.data.success) {
        setProducts(response.data.data || []);
        console.log('✅ Fetched products:', response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Check favorite status
  useEffect(() => {
    const checkFavorite = async () => {
      if (isAuthenticated && user) {
        try {
          const favoritesRes = await favoritesAPI.getFavorites();
          const favorites = favoritesRes.data.data as Array<{ _id: string } | string>;
          setIsFavorite(favorites.some((fav) => 
            (typeof fav === 'string' ? fav : fav._id) === id || fav.toString() === id
          ));
        } catch (error) {
          console.error('Error checking favorites:', error);
        }
      }
    };

    checkFavorite();
  }, [id, isAuthenticated, user]);

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save merchants to your favorites',
        variant: 'destructive',
      });
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await favoritesAPI.removeFavorite(id as string);
        setIsFavorite(false);
        updateFavoritesCount();
        toast({
          title: 'Removed from Favorites',
          description: `${merchant?.businessName} has been removed from your favorites`,
          variant: 'destructive',
        });
      } else {
        await favoritesAPI.addFavorite(id as string);
        setIsFavorite(true);
        updateFavoritesCount();
        toast({
          title: 'Added to Favorites',
          description: `${merchant?.businessName} has been added to your favorites`,
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update favorites',
        variant: 'destructive',
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'The business page link has been copied to your clipboard',
    });
  };

  // Share via WhatsApp
  const handleWhatsAppShare = () => {
    if (!merchant) return;
    const message = `Check out ${merchant.businessName}, a ${merchant.businessType} in ${merchant.location}! ${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Contact handler
  const handleContactMerchant = () => {
    setShowContactModal(true);
  };

  // Add this function with the other handler functions in the MerchantDetail component

// WhatsApp service inquiry handler
const handleServiceWhatsAppInquiry = (service: Service) => {
  const whatsappNumber = merchant?.whatsappNumber || merchant?.whatsapp || merchant?.phone;
  
  if (!whatsappNumber) {
    toast({
      title: 'WhatsApp Not Available',
      description: 'This merchant has not provided a contact number',
      variant: 'destructive',
    });
    return;
  }

  const formattedNumber = formatPhoneNumberForWhatsApp(whatsappNumber);
  const message = `Hello ${merchant.businessName}! I'm interested in your service: ${service.name}${service.price ? ` - ${service.price}` : ''}. ${service.description ? `Description: ${service.description}` : ''}`;
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

  // Directions handler
  const handleGetDirections = () => {
    if (merchant?.address) {
      const encodedAddress = encodeURIComponent(`${merchant.address}, ${merchant.location}`);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Address Not Available',
        description: 'This merchant has not provided their address',
        variant: 'destructive',
      });
    }
  };

  // Google My Business handler
  const handleOpenGoogleBusiness = () => {
    if (merchant?.googleBusinessUrl) {
      window.open(merchant.googleBusinessUrl, '_blank', 'noopener,noreferrer');
    } else {
      const searchQuery = encodeURIComponent(`${merchant?.businessName} ${merchant?.address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Social media handler
  const handleSocialMediaClick = (url: string, platform: string) => {
    if (url) {
      // Ensure URL has proper protocol
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = `https://${url}`;
      }
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Not Available`,
        description: `This merchant hasn't provided their ${platform} profile`,
        variant: 'destructive',
      });
    }
  };

  // Review handler
  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to write a review',
        variant: 'destructive',
      });
      return;
    }
    setShowReviewModal(true);
  };

  // Report handler
  const handleReportIssue = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to report an issue',
        variant: 'destructive',
      });
      return;
    }
    setShowReportModal(true);
  };

  // Image gallery handlers
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && merchant?.gallery) {
      setSelectedImageIndex((selectedImageIndex + 1) % merchant.gallery.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && merchant?.gallery) {
      setSelectedImageIndex((selectedImageIndex - 1 + merchant.gallery.length) % merchant.gallery.length);
    }
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  // Format business hours using utility functions
  const businessHoursFormatted = formatBusinessHours(merchant?.businessHours || {});
  const isOpen = isBusinessCurrentlyOpen(merchant?.businessHours || {});
  
  // Get current day for highlighting
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Enhanced social links with fallbacks for different data structures
  const socialLinks = {
    facebook: merchant?.facebookUrl || merchant?.socialLinks?.facebook,
    instagram: merchant?.instagramUrl || merchant?.socialLinks?.instagram,
    twitter: merchant?.twitterUrl || merchant?.socialLinks?.twitter,
    tiktok: merchant?.tiktokUrl || merchant?.socialLinks?.tiktok,
    youtube: merchant?.youtubeUrl || merchant?.socialLinks?.youtube,
    linkedin: merchant?.linkedinUrl || merchant?.socialLinks?.linkedin,
    website: merchant?.website,
    whatsapp: merchant?.whatsappNumber || merchant?.whatsapp,
  };

  // Filter out empty social links
  const availableSocialLinks = Object.entries(socialLinks).filter(([_, url]) => 
    url && url.trim() !== ''
  );

  // Utility function to format phone numbers for WhatsApp
  const formatPhoneNumberForWhatsApp = (phone: string) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If empty after cleaning, return empty
    if (!cleaned) return '';
    
    // If the number starts with 0, replace with country code for Kenya (254)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `254${cleaned.substring(1)}`;
    }
    
    // If the number starts with 7 or 1 and is 9 digits, assume it's Kenyan without 0
    if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
      return `254${cleaned}`;
    }
    
    // If it's already 12 digits with 254, return as is
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return cleaned;
    }
    
    // For other formats, return as is
    return cleaned;
  };

  // Utility function to format phone numbers for tel: links
  const formatPhoneNumberForCall = (phone: string) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If empty after cleaning, return empty
    if (!cleaned) return '';
    
    // Convert to international format for tel: links
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = `+254${cleaned.substring(1)}`;
    } else if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
      cleaned = `+254${cleaned}`;
    } else if (cleaned.startsWith('254') && cleaned.length === 12) {
      cleaned = `+${cleaned}`;
    } else {
      cleaned = `+${cleaned}`;
    }
    
    return cleaned;
  };

  // WhatsApp product inquiry handler - FIXED
  const handleProductWhatsAppInquiry = (product: Product) => {
    const whatsappNumber = merchant?.whatsappNumber || merchant?.whatsapp || merchant?.phone;
    
    if (!whatsappNumber) {
      toast({
        title: 'WhatsApp Not Available',
        description: 'This merchant has not provided a contact number',
        variant: 'destructive',
      });
      return;
    }

    const formattedNumber = formatPhoneNumberForWhatsApp(whatsappNumber);
    const message = `Hello ${merchant.businessName}! I'm interested in your product: ${product.name} - KES ${product.price?.toLocaleString()}. ${product.description ? `Description: ${product.description}` : ''}`;
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // General WhatsApp message handler - FIXED
  const handleGeneralWhatsApp = () => {
    const whatsappNumber = merchant?.whatsappNumber || merchant?.whatsapp || merchant?.phone;
    
    if (!whatsappNumber) {
      toast({
        title: 'WhatsApp Not Available',
        description: 'This merchant has not provided a contact number',
        variant: 'destructive',
      });
      return;
    }

    const formattedNumber = formatPhoneNumberForWhatsApp(whatsappNumber);
    const message = `Hello ${merchant.businessName}! I found your business on YourPlatform and I'm interested in your services.`;
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Phone call handler - FIXED
  const handlePhoneCall = (phoneNumber?: string) => {
    const numberToCall = phoneNumber || merchant?.phone;
    
    if (!numberToCall) {
      toast({
        title: 'Phone Number Not Available',
        description: 'This merchant has not provided a phone number',
        variant: 'destructive',
      });
      return;
    }

    const formattedNumber = formatPhoneNumberForCall(numberToCall);
    window.location.href = `tel:${formattedNumber}`;
  };

  if (loading || isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageSkeleton>
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square w-full rounded" />
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-5 w-48" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-28" />
                    <Skeleton className="h-12 w-24" />
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b p-6">
                <div className="flex space-x-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20" />
                  ))}
                </div>
              </div>
              <div className="p-8 space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageSkeleton>
        <Footer />
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex flex-col items-center justify-center flex-1 p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Merchant</h1>
          <p className="text-gray-600 mb-6">{error || 'Merchant not found'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": merchant.businessName,
            "description": merchant.description,
            "url": window.location.href,
            "telephone": merchant.phone,
            "email": merchant.email,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": merchant.address,
              "addressLocality": merchant.location,
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": merchant.latitude,
              "longitude": merchant.longitude,
            },
            "openingHours": Object.entries(businessHoursFormatted).map(([day, hours]) => 
              `${day.substring(0, 2)} ${hours}`
            ),
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": merchant.rating,
              "reviewCount": merchant.reviews,
            },
            "image": merchant.gallery?.[0] || merchant.bannerImage,
            "priceRange": merchant.priceRange,
            "sameAs": Object.values(socialLinks).filter(Boolean),
          })
        }}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 w-full">
        {/* Hero Section - Mobile Optimized */}
        <header className="bg-white rounded-xl lg:rounded-lg shadow-lg overflow-hidden mb-4 lg:mb-6 w-full">
          <Carousel className="relative h-48 sm:h-56 md:h-64 lg:h-80 w-full">
            <CarouselContent>
              <CarouselItem>
                <img
                  src={merchant.bannerImage}
                  alt={`${merchant.businessName} - ${merchant.businessType} in ${merchant.location}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </CarouselItem>
              {merchant.gallery?.map((image: string, index: number) => (
                <CarouselItem key={index}>
                  <img
                    src={image}
                    alt={`${merchant.businessName} gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 lg:bottom-6 left-3 lg:left-6 right-3 lg:right-6">
              <div className="flex items-end gap-3 lg:gap-6 w-full">
                <img
                  src={merchant.logo}
                  alt={`${merchant.businessName} logo`}
                  className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-lg border-2 lg:border-4 border-white shadow-lg object-cover flex-shrink-0"
                  loading="eager"
                />
                <div className="text-white flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 lg:mb-2 flex-wrap">
                    <h1 className="text-lg lg:text-2xl xl:text-3xl font-bold truncate">
                      {merchant.businessName}
                    </h1>
                    {merchant.verified && (
                      <div className="verified-badge bg-white text-primary px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shrink-0">
                        <Check className="h-3 w-3" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:text-sm flex-wrap">
                    <span className="bg-white/20 px-2 py-1 rounded-full truncate">
                      {merchant.businessType}
                    </span>
                    <span className="truncate">Est. {merchant.yearEstablished}</span>
                    <span className="truncate">{merchant.location}</span>
                  </div>
                </div>
                {/* Mobile Action Buttons */}
                <div className="flex gap-1 lg:gap-2 flex-shrink-0">
                  <Button 
                    size="sm"
                    variant="outline" 
                    className={`${
                      isFavorite 
                        ? "bg-primary border-primary text-white hover:bg-primary-dark" 
                        : "bg-white/10 border-white text-white hover:bg-white hover:text-gray-900"
                    } h-8 lg:h-10 px-2 lg:px-4`}
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                  >
                    {favoriteLoading ? (
                      <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
                    ) : (
                      <Heart className={`h-3 w-3 lg:h-4 lg:w-4 ${isFavorite ? "fill-current" : ""}`} />
                    )}
                    <span className="hidden sm:inline ml-1 lg:ml-2">
                      {isFavorite ? 'Saved' : 'Save'}
                    </span>
                  </Button>
                  
                  {/* Share Link Button */}
                  <Button 
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900 h-8 lg:h-10 px-2 lg:px-4"
                    onClick={handleCopyLink}
                  >
                    <Share2 className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline ml-1 lg:ml-2">Share</span>
                  </Button>
                  
                  {/* Mobile Menu Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900 h-8 lg:h-10 px-2 lg:px-4"
                      >
                        <Menu className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] w-full">
                      <ScrollArea className="h-full w-full">
                        <div className="space-y-6 p-4 w-full">
                          {/* Quick Actions */}
                          <div className="w-full">
                            <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                            <div className="space-y-3 w-full">
                              <Button 
                                className="w-full bg-primary hover:bg-primary-dark"
                                onClick={handleContactMerchant}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Contact Now
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleWriteReview}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Write a Review
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleGetDirections}
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Get Directions
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleOpenGoogleBusiness}
                              >
                                <Map className="h-4 w-4 mr-2" />
                                View on Google
                              </Button>
                              {/* Add Share to mobile menu as well */}
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleCopyLink}
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Profile
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full text-red-500 hover:bg-red-50"
                                onClick={handleReportIssue}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Report an Issue
                              </Button>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="w-full">
                            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                            <div className="space-y-4 w-full">
                              <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-500">Phone</p>
                                  <button 
                                    onClick={() => handlePhoneCall()}
                                    className="font-medium text-primary hover:text-primary-dark text-left"
                                  >
                                    {merchant.phone}
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <a 
                                    href={`mailto:${merchant.email}`} 
                                    className="font-medium text-primary hover:text-primary-dark"
                                  >
                                    {merchant.email}
                                  </a>
                                </div>
                              </div>
                              {(merchant.whatsappNumber || merchant.whatsapp || merchant.phone) && (
                                <div className="flex items-center gap-3">
                                  <Send className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <p className="text-sm text-gray-500">WhatsApp</p>
                                    <button
                                      onClick={handleGeneralWhatsApp}
                                      className="font-medium text-primary hover:text-primary-dark text-left"
                                    >
                                      Message on WhatsApp
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Business Hours */}
                          <div className="w-full">
                            <h3 className="font-semibold text-lg mb-4">Business Hours</h3>
                            <div className="space-y-2 w-full">
                              {Object.entries(businessHoursFormatted).map(([day, hoursStr]) => (
                                <div 
                                  key={day} 
                                  className={`flex justify-between text-sm ${
                                    day === currentDay ? 'font-medium text-primary' : 'text-gray-600'
                                  }`}
                                >
                                  <span className="capitalize">{day}</span>
                                  <span>{hoursStr}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </Carousel>
        </header>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 w-full">
          {/* Sidebar - Hidden on mobile, shown in sheet */}
          <aside className="hidden lg:block space-y-6 w-full">
            {/* Trust Indicators */}
            <Card className="w-full">
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">Why Choose {merchant.businessName}</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {merchant.verified && (
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <p className="text-sm">Verified Business since {merchant.yearEstablished}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <p className="text-sm">{merchant.rating} ({merchant.reviews} reviews)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <p className="text-sm">Serving customers for {new Date().getFullYear() - merchant.yearEstablished} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="w-full">
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <button 
                        onClick={() => handlePhoneCall()}
                        className="font-medium text-primary hover:text-primary-dark text-left"
                      >
                        {merchant.phone}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a 
                        href={`mailto:${merchant.email}`} 
                        className="font-medium text-primary hover:text-primary-dark"
                      >
                        {merchant.email}
                      </a>
                    </div>
                  </div>
                  {(merchant.whatsappNumber || merchant.whatsapp || merchant.phone) && (
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <button
                          onClick={handleGeneralWhatsApp}
                          className="font-medium text-primary hover:text-primary-dark text-left"
                        >
                          Message on WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Social Links Section */}
                  {availableSocialLinks.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-3">Follow & Connect</p>
                      <div className="grid grid-cols-2 gap-2">
                        {availableSocialLinks.map(([platform, url]) => {
                          const IconComponent = socialIcons[platform as keyof typeof socialIcons] || ExternalLink;
                          const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                          
                          return (
                            <Button
                              key={platform}
                              variant="outline"
                              size="sm"
                              className="flex items-center justify-start gap-2 h-auto py-2"
                              onClick={() => handleSocialMediaClick(url as string, platform)}
                            >
                              <IconComponent className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs truncate">{platformName}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-2">
                  {Object.entries(businessHoursFormatted).map(([day, hoursStr]) => (
                    <div 
                      key={day} 
                      className={`flex justify-between text-sm ${
                        day === currentDay ? 'font-medium text-primary' : 'text-gray-600'
                      }`}
                    >
                      <span className="capitalize">{day}</span>
                      <span>{hoursStr}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <nav className="space-y-3 w-full">
              <Button 
                className="w-full bg-primary hover:bg-primary-dark"
                onClick={handleContactMerchant}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Now
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleWriteReview}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGetDirections}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleOpenGoogleBusiness}
              >
                <Map className="h-4 w-4 mr-2" />
                View on Google
              </Button>
              {/* Add Share button to desktop sidebar */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCopyLink}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-red-500 hover:bg-red-50"
                onClick={handleReportIssue}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Report an Issue
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-2 space-y-4 lg:space-y-6 w-full">
            {/* Mobile Quick Stats Bar */}
            <div className="lg:hidden bg-white rounded-xl p-4 shadow-sm w-full">
              <div className="flex items-center justify-between text-sm w-full">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{merchant.rating}</span>
                  <span className="text-gray-500">({merchant.reviews})</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </div>
                <div className="text-gray-500">
                  Est. {merchant.yearEstablished}
                </div>
              </div>
            </div>

            <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 lg:h-10">
                <TabsTrigger value="services" className="text-xs lg:text-sm">
                  Products
                </TabsTrigger>
                <TabsTrigger value="about" className="text-xs lg:text-sm">
                  About
                </TabsTrigger>
                <TabsTrigger value="gallery" className="text-xs lg:text-sm">
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs lg:text-sm">
                  Reviews
                </TabsTrigger>
              </TabsList>

              {/* Services Tab - Enhanced Mobile Responsiveness */}
    
<TabsContent value="services" className="space-y-4 lg:space-y-6 w-full">
  {/* Products Section */}
  <Card className="w-full">
    <CardHeader className="px-4 lg:px-6 py-4 lg:py-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Products</h2>
    </CardHeader>
    <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6 w-full">
      {productsLoading ? (
        <div className="flex justify-center py-8 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 w-full">
          {products.map((product) => (
            <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group bg-white w-full flex flex-col h-full">
              {/* Product Image - Clickable */}
              <Link to={`/product/${product._id}`} className="w-full">
                <div className="aspect-square overflow-hidden bg-gray-100 relative cursor-pointer w-full">
                  <img
                    src={product.primaryImage || product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Featured
                    </div>
                  )}
                </div>
              </Link>
              
              {/* Product Details */}
              <div className="p-3 lg:p-4 w-full flex flex-col flex-grow">
                <Link to={`/product/${product._id}`} className="w-full">
                  <h3 className="font-semibold text-base lg:text-lg mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2 flex-grow">{product.description}</p>
                
                {/* Price and View Link */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg lg:text-xl font-bold text-green-600">
                      KES {product.price?.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        KES {product.originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Link 
                    to={`/product/${product._id}`}
                    className="text-orange-500 hover:text-green-600 underline text-sm font-medium transition-colors"
                  >
                    <span className="text-orange-600 hover:text-green-600">
                      <Eye className="h-4 w-4 inline-block ml-1" /> View 
                    </span>
                  </Link>
                </div>

                {/* Category & Stock */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                  {product.stockQuantity > 0 ? (
                    <span className="text-green-600">In Stock</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="flex gap-2 w-full mt-auto">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-xs min-h-[2.5rem]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductWhatsAppInquiry(product);
                    }}
                  >
                    <Send className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs min-h-[2.5rem]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhoneCall(merchant.phone);
                    }}
                  >
                    <Phone className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Call
                  </Button>
                  
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 lg:py-12 w-full">
          <div className="text-gray-400 mb-4">
            <ImageIcon className="h-12 w-12 lg:h-16 lg:w-16 mx-auto" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No Products Available</h3>
          <p className="text-gray-600 text-sm lg:text-base">This merchant hasn't listed any products yet.</p>
        </div>
      )}
    </CardContent>
  </Card>

  {/* Services Section */}
  {merchant.services && merchant.services.length > 0 && (
    <Card className="w-full">
      <CardHeader className="px-4 lg:px-6 py-4 lg:py-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Services & Pricing</h2>
      </CardHeader>
      <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6 w-full">
        <ul className="space-y-6 w-full">
          {merchant.services.map((service, index: number) => (
            <li key={index} className="border-b pb-6 last:border-b-0 w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 w-full mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{service.name}</p>
                  <p className="text-xs lg:text-sm text-gray-600 mt-1">{service.description}</p>
                </div>
                <p className="font-semibold text-primary text-sm lg:text-base whitespace-nowrap sm:ml-4">
                  {service.price || 'Contact for pricing'}
                </p>
              </div>
              
              {/* CTA Buttons for Call and WhatsApp */}
              <div className="flex gap-2 w-full mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs min-h-[2.5rem]"
                  onClick={() => handlePhoneCall(merchant.phone)}
                >
                  <Phone className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  Call Now
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs min-h-[2.5rem]"
                  onClick={() => handleServiceWhatsAppInquiry(service)}
                >
                  <Send className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  WhatsApp
                </Button>
                
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )}
</TabsContent>

              {/* About Tab - Enhanced Mobile Responsiveness */}
              <TabsContent value="about">
                <Card className="w-full">
                  <CardHeader className="px-4 lg:px-6 py-4 lg:py-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">About {merchant.businessName}</h2>
                  </CardHeader>
                  <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6 w-full">
                    <p className="text-gray-600 leading-relaxed text-sm lg:text-base">{merchant.description}</p>
                    
                    {/* Social Links in About Section */}
                    {availableSocialLinks.length > 0 && (
                      <div className="mt-6 pt-6 border-t w-full">
                        <h4 className="font-semibold text-gray-900 mb-3 text-base lg:text-lg">Connect with {merchant.businessName}</h4>
                        <div className="flex flex-wrap gap-2 w-full">
                          {availableSocialLinks.map(([platform, url]) => {
                            const IconComponent = socialIcons[platform as keyof typeof socialIcons] || ExternalLink;
                            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                            
                            return (
                              <Button
                                key={platform}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-xs lg:text-sm"
                                onClick={() => handleSocialMediaClick(url as string, platform)}
                              >
                                <IconComponent className="h-3 w-3 lg:h-4 lg:w-4" />
                                <span>{platformName}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap w-full">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-lg font-semibold ml-1">{merchant.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm lg:text-base">({merchant.reviews} reviews)</span>
                      {merchant.verified && merchant.verifiedDate && (
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          Verified since {new Date(merchant.verifiedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gallery Tab - Enhanced Mobile Responsiveness */}
              <TabsContent value="gallery">
                <Card className="w-full">
                  <CardHeader className="px-4 lg:px-6 py-4 lg:py-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Photo Gallery</h2>
                    <p className="text-gray-600 mt-2 text-sm lg:text-base">
                      {merchant.gallery?.length || 0} photos showcasing {merchant.businessName}'s work and premises
                    </p>
                  </CardHeader>
                  <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6 w-full">
                    {merchant.gallery && merchant.gallery.length > 0 ? (
                      <div className="space-y-4 lg:space-y-6 w-full">
                        {/* Grid View */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4 w-full">
                          {merchant.gallery.map((image: string, index: number) => (
                            <div
                              key={index}
                              className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative w-full"
                              onClick={() => handleImageClick(index)}
                            >
                              <img
                                src={image}
                                alt={`${merchant.businessName} gallery image ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 lg:py-12 w-full">
                        <Image className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
                        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No Photos Available</h3>
                        <p className="text-gray-600 text-sm lg:text-base">This merchant hasn't uploaded any photos yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab - Enhanced Mobile Responsiveness */}
              <TabsContent value="reviews">
                <Card className="w-full">
                  <CardHeader className="px-4 lg:px-6 py-4 lg:py-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  </CardHeader>
                  <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6 w-full">
                    <ReviewsSection merchantId={merchant._id} reviews={reviews} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Location & Map - Enhanced Mobile Responsiveness */}
            <Card className="w-full">
              <CardHeader className="px-4 lg:px-6 py-4 lg:py-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Location</h2>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6 w-full">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm lg:text-base break-words">{merchant.address}</p>
                    <p className="text-gray-600 text-sm lg:text-base break-words">{merchant.location}</p>
                  </div>
                </div>
                <div className="rounded-lg h-48 lg:h-64 overflow-hidden w-full">
                  <iframe 
                    title={`Location of ${merchant.businessName} in ${merchant.location}`}
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(merchant.address)},${encodeURIComponent(merchant.location)}&z=16&output=embed`}
                    loading="lazy"
                    className="w-full h-full"
                  ></iframe>
                </div>
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary-dark"
                  onClick={handleGetDirections}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Image Modal */}
      {selectedImageIndex !== null && merchant?.gallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 lg:p-4 w-full">
          <div className="relative max-w-4xl max-h-full w-full mx-4">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 lg:top-4 right-2 lg:right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              aria-label="Close image viewer"
            >
              <X className="h-4 w-4 lg:h-6 lg:w-6" />
            </button>

            {/* Navigation Buttons */}
            {merchant.gallery.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2 lg:p-3"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4 lg:h-6 lg:w-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2 lg:p-3"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4 lg:h-6 lg:w-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={merchant.gallery[selectedImageIndex]}
              alt={`${merchant.businessName} gallery image ${selectedImageIndex + 1}`}
              className="w-full h-full object-contain max-h-[80vh] rounded-lg"
            />

            {/* Image Counter */}
            <div className="absolute bottom-2 lg:bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm">
              {selectedImageIndex + 1} / {merchant.gallery.length}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4 w-full">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-4 lg:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contact {merchant.businessName}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContactModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4 w-full">
              {(merchant.whatsappNumber || merchant.whatsapp || merchant.phone) && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg w-full">
                  <Send className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">WhatsApp</p>
                    <button
                      onClick={handleGeneralWhatsApp}
                      className="text-primary hover:underline text-left"
                    >
                      Message on WhatsApp
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg w-full">
                <Phone className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Phone</p>
                  <button
                    onClick={() => handlePhoneCall()}
                    className="text-primary hover:underline text-left"
                  >
                    {merchant.phone}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg w-full">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Email</p>
                  <a 
                    href={`mailto:${merchant.email}`}
                    className="text-primary hover:underline"
                  >
                    {merchant.email}
                  </a>
                </div>
              </div>
              
              {/* Social Links in Contact Modal */}
              {availableSocialLinks.length > 0 && (
                <div className="pt-4 border-t w-full">
                  <p className="font-medium mb-3">Connect on Social Media</p>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {availableSocialLinks.map(([platform, url]) => {
                      const IconComponent = socialIcons[platform as keyof typeof socialIcons] || ExternalLink;
                      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                      
                      return (
                        <Button
                          key={platform}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSocialMediaClick(url as string, platform)}
                          className="justify-start text-xs w-full"
                        >
                          <IconComponent className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                          <span className="capitalize">{platformName}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          merchant={merchant}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => {
            setShowReviewModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          merchant={merchant}
          onClose={() => setShowReportModal(false)}
          onReportSubmitted={() => {
            setShowReportModal(false);
            toast({
              title: 'Report Submitted',
              description: 'Thank you for your report. We will review it shortly.',
            });
          }}
        />
      )}
      
      <Footer />
    </div>
  );
};

// Review Modal Component
const ReviewModal = ({ merchant, onClose, onReviewSubmitted }: {
  merchant: Merchant;
  onClose: () => void;
  onReviewSubmitted: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const ratingDescriptions = [
    'Poor',
    'Fair',
    'Good',
    'Very Good',
    'Excellent',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({
        title: 'Too Many Images',
        description: 'You can upload a maximum of 5 images',
        variant: 'destructive',
      });
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create image previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('merchant', merchant._id);
      formData.append('rating', rating.toString());
      formData.append('content', comment.trim());
      
      // Append images if any
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      await reviewsAPI.createReview(formData);
      
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review!',
      });
      
      onReviewSubmitted();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 w-full">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Write a Review for {merchant.businessName}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">{ratingDescriptions[rating - 1]}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this merchant..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos (Optional, up to 5)
            </label>
            <div className="space-y-3">
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-600">Upload Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Report Modal Component
const ReportModal = ({ merchant, onClose, onReportSubmitted }: {
  merchant: Merchant;
  onClose: () => void;
  onReportSubmitted: () => void;
}) => {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'false_information', label: 'False Information' },
    { value: 'spam', label: 'Spam' },
    { value: 'fraud', label: 'Fraud or Scam' },
    { value: 'poor_service', label: 'Poor Service' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportType || !description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a report type and provide a description',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onReportSubmitted();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 w-full">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Report Issue with {merchant.businessName}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Issue
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a reason</option>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide more details about the issue..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
              required
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Reports are reviewed by our team. False reports may result in account restrictions.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantDetail;