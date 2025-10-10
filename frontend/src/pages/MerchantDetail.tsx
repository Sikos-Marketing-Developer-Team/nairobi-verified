import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Star, MapPin, Check, Phone, Mail, Clock, Heart, ExternalLink, 
  Image, MessageSquare, AlertCircle, Loader2, X, Send, 
  Facebook, Instagram, Globe, Map, Twitter, Film, Copy, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewsSection from '@/components/ReviewsSection';
import { merchantsAPI, reviewsAPI, favoritesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePageLoading } from '@/hooks/use-loading';
import { ProductDetailSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '../contexts/FavoritesContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { isBusinessCurrentlyOpen, formatBusinessHours } from '@/utils/businessHours';

// Social media icon mapping
const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Film,
  website: ExternalLink,
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
  const [merchant, setMerchant] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const isPageLoading = usePageLoading(700);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

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
        setLoading(false);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to load merchant data');
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

  // Check favorite status
  useEffect(() => {
    const checkFavorite = async () => {
      if (isAuthenticated && user) {
        try {
          const favoritesRes = await favoritesAPI.getFavorites();
          const favorites = favoritesRes.data.data;
          setIsFavorite(favorites.some((fav: any) => 
            fav._id === id || fav.toString() === id
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
          description: `${merchant.businessName} has been removed from your favorites`,
          variant: 'destructive',
        });
      } else {
        await favoritesAPI.addFavorite(id as string);
        setIsFavorite(true);
        updateFavoritesCount();
        toast({
          title: 'Added to Favorites',
          description: `${merchant.businessName} has been added to your favorites`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update favorites',
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
    const message = `Check out ${merchant.businessName}, a ${merchant.businessType} in ${merchant.location}! ${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Contact handler
  const handleContactMerchant = () => {
    setShowContactModal(true);
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
      const searchQuery = encodeURIComponent(`${merchant.businessName} ${merchant.address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Social media handler
  const handleSocialMediaClick = (url: string, platform: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: `${platform} Not Available`,
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

  // Format business hours using utility functions
  const businessHoursFormatted = formatBusinessHours(merchant?.businessHours || {});
  const isOpen = isBusinessCurrentlyOpen(merchant?.businessHours || {});
  
  // Get current day for highlighting
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Social links
  const socialLinks = {
    facebook: merchant?.facebookUrl,
    instagram: merchant?.instagramUrl,
    twitter: merchant?.twitterUrl,
    tiktok: merchant?.tiktokUrl,
    website: merchant?.website,
    whatsapp: merchant?.whatsapp,
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Carousel */}
        <header className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <Carousel className="relative h-64 md:h-80">
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
            <CarouselPrevious />
            <CarouselNext />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end gap-6">
                <img
                  src={merchant.logo}
                  alt={`${merchant.businessName} logo`}
                  className="w-24 h-24 rounded-lg border-4 border-white shadow-lg object-cover"
                  loading="eager"
                />
                <div className="text-white flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{merchant.businessName}</h1>
                    {merchant.verified && (
                      <div className="verified-badge bg-white text-primary px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">{merchant.businessType}</span>
                    <span>Est. {merchant.yearEstablished}</span>
                    <span>{merchant.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className={`${
                      isFavorite 
                        ? "bg-primary border-primary text-white hover:bg-primary-dark" 
                        : "bg-white/10 border-white text-white hover:bg-white hover:text-gray-900"
                    }`}
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                  >
                    {favoriteLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    )}
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900"
                    onClick={handleWhatsAppShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Carousel>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Trust Indicators */}
            <Card>
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
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a 
                        href={`tel:${merchant.phone}`} 
                        className="font-medium text-primary hover:text-primary-dark"
                        aria-label={`Call ${merchant.businessName} at ${merchant.phone}`}
                      >
                        {merchant.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a 
                        href={`mailto:${merchant.email}`} 
                        className="font-medium text-primary hover:text-primary-dark"
                        aria-label={`Email ${merchant.businessName} at ${merchant.email}`}
                      >
                        {merchant.email}
                      </a>
                    </div>
                  </div>
                  {merchant.whatsapp && (
                    <div className="flex items-center gap-3">
                      <Send className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <a 
                          href={`https://wa.me/${merchant.whatsapp}?text=${encodeURIComponent(`Hello ${merchant.businessName}, I'm interested in your services!`)}`}
                          className="font-medium text-primary hover:text-primary-dark"
                          aria-label={`Message ${merchant.businessName} on WhatsApp`}
                        >
                          Message on WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-3">Follow & Connect</p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(socialLinks).map(([platform, url]) => {
                        if (!url) return null;
                        const IconComponent = socialIcons[platform as keyof typeof socialIcons] || ExternalLink;
                        return (
                          <Button
                            key={platform}
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[80px]"
                            onClick={() => handleSocialMediaClick(url as string, platform)}
                            aria-label={`Visit ${merchant.businessName} on ${platform}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[80px]"
                        onClick={handleOpenGoogleBusiness}
                        aria-label={`View ${merchant.businessName} on Google Business`}
                      >
                        <Map className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
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
            <nav className="space-y-3" aria-label="Quick actions for merchant">
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
          <section className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-gray-900">About {merchant.businessName}</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{merchant.description}</p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-lg font-semibold ml-1">{merchant.rating}</span>
                      </div>
                      <span className="text-gray-500">({merchant.reviews} reviews)</span>
                      {merchant.verified && merchant.verifiedDate && (
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          Verified since {new Date(merchant.verifiedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-gray-900">Services & Pricing</h2>
                  </CardHeader>
                  <CardContent>
                    {merchant.services?.length > 0 ? (
                      <ul className="space-y-4">
                        {merchant.services.map((service: any, index: number) => (
                          <li key={index} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-gray-600">{service.description}</p>
                            </div>
                            <p className="font-semibold">{service.price || 'Contact for pricing'}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No services listed. Contact the business for more information.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery">
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
                  </CardHeader>
                  <CardContent>
                    <Carousel className="w-full">
                      <CarouselContent>
                        {merchant.gallery.map((image: string, index: number) => (
                          <CarouselItem key={index}>
                            <figure className="aspect-square overflow-hidden rounded-lg">
                              <img
                                src={image}
                                alt={`${merchant.businessName} gallery image ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                                loading="lazy"
                              />
                            </figure>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  </CardHeader>
                  <CardContent>
                    <ReviewsSection merchantId={merchant._id} reviews={reviews} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Location & Map */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Location</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{merchant.address}</p>
                    <p className="text-gray-600">{merchant.location}</p>
                  </div>
                </div>
                <div className="rounded-lg h-64 overflow-hidden">
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
                  ></iframe>
                </div>
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary-dark"
                  onClick={handleGetDirections}
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Enhanced Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
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
            <div className="space-y-4">
              {merchant.whatsapp && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Send className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <a 
                      href={`https://wa.me/${merchant.whatsapp}?text=${encodeURIComponent(`Hello ${merchant.businessName}, I'm interested in your services!`)}`}
                      className="text-primary hover:underline"
                    >
                      Message on WhatsApp
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a 
                    href={`tel:${merchant.phone}`}
                    className="text-primary hover:underline"
                  >
                    {merchant.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <a 
                    href={`mailto:${merchant.email}`}
                    className="text-primary hover:underline"
                  >
                    {merchant.email}
                  </a>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="font-medium mb-3">Connect on Social Media</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    const IconComponent = socialIcons[platform as keyof typeof socialIcons] || ExternalLink;
                    return (
                      <Button
                        key={platform}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSocialMediaClick(url as string, platform)}
                        className="justify-start"
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        <span className="capitalize">{platform}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
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
  merchant: any;
  onClose: () => void;
  onReviewSubmitted: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const ratingDescriptions = [
    'Poor',
    'Fair',
    'Good',
    'Very Good',
    'Excellent',
  ];

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
      await reviewsAPI.createReview({
        merchant: merchant._id,
        rating,
        content: comment.trim()
      });
      
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review!',
      });
      
      onReviewSubmitted();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
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
  merchant: any;
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
    } catch (error: any) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
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