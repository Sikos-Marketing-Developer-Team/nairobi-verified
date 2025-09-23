// src/pages/MerchantDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Check, Phone, Mail, Clock, Heart, ExternalLink, Image, MessageSquare, AlertCircle, Loader2, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const MerchantDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
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

  // Fetch merchant data
  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setLoading(true);
        const merchantRes = await merchantsAPI.getMerchant(id as string);
        setMerchant(merchantRes.data.data);
        
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

  // Check if merchant is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (isAuthenticated && user) {
        try {
          const favoritesRes = await favoritesAPI.getFavorites();
          const favorites = favoritesRes.data.data;
          setIsFavorite(favorites.some((fav: any) => fav._id === id));
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
        toast({
          title: 'Removed from favorites',
          description: `${merchant.businessName} has been removed from your favorites`,
          variant: 'destructive',
        });
      } else {
        await favoritesAPI.addFavorite(id as string);
        setIsFavorite(true);
        toast({
          title: 'Added to favorites',
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

  // Handle contact merchant
  const handleContactMerchant = () => {
    setShowContactModal(true);
  };

  // Handle write review
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

  // Handle get directions
  const handleGetDirections = () => {
    if (merchant.address) {
      const encodedAddress = encodeURIComponent(merchant.address);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      toast({
        title: 'Address Not Available',
        description: 'This merchant has not provided their address',
        variant: 'destructive',
      });
    }
  };

  // Handle report issue
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

  if (loading || isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          {/* Merchant Detail Skeleton - using custom layout for merchant details */}
          <div className="space-y-8">
            {/* Merchant Header Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square w-full rounded" />
                    ))}
                  </div>
                </div>

                {/* Info Skeleton */}
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

                  {/* Action Buttons Skeleton */}
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-28" />
                    <Skeleton className="h-12 w-24" />
                  </div>

                  {/* Contact Info Skeleton */}
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

            {/* Tabs Skeleton */}
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
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Merchant</h2>
          <p className="text-gray-600 mb-6">{error || 'Merchant not found'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Format business hours for display
  const businessHoursFormatted: Record<string, string> = {};
  Object.entries(merchant.businessHours || {}).forEach(([day, hours]: [string, any]) => {
    if (hours.closed) {
      businessHoursFormatted[day] = 'Closed';
    } else {
      businessHoursFormatted[day] = `${hours.open} - ${hours.close}`;
    }
  });

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const isOpen = businessHoursFormatted[currentDay] !== 'Closed';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-64 md:h-80">
            <img
              src={merchant.bannerImage}
              alt={merchant.businessName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end gap-6">
                <img
                  src={merchant.logo}
                  alt={merchant.businessName}
                  className="w-24 h-24 rounded-lg border-4 border-white shadow-lg object-cover"
                />
                <div className="text-white flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{merchant.businessName}</h1>
                    <div className="verified-badge bg-white">
                      <Check className="h-4 w-4" />
                      Verified
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">{merchant.businessType}</span>
                    <span>Est. {merchant.yearEstablished}</span>
                  </div>
                </div>
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
                  {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {merchant.businessName}</h2>
                <p className="text-gray-600 leading-relaxed">{merchant.description}</p>
                
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold ml-1">{merchant.rating}</span>
                  </div>
                  <span className="text-gray-500">({merchant.reviews} reviews)</span>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    Verified since {new Date(merchant.verifiedDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {merchant.gallery.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${merchant.businessName} gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
                <ReviewsSection merchantId={merchant._id} reviews={reviews} />
              </CardContent>
            </Card>

            {/* Location & Map */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{merchant.address}</p>
                    <p className="text-gray-600">{merchant.location}</p>
                  </div>
                </div>
                
                {/* Interactive Map */}
                <div className="rounded-lg h-64 overflow-hidden">
                  <iframe 
                    title="Merchant Location"
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(merchant.address)},Nairobi&z=16&output=embed`}
                  ></iframe>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary-dark"
                  onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(merchant.address)},Nairobi&z=16`, '_blank')}
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${merchant.phone}`} className="font-medium text-primary hover:text-primary-dark">
                        {merchant.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${merchant.email}`} className="font-medium text-primary hover:text-primary-dark">
                        {merchant.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-primary-dark">
                        Visit Website
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(businessHoursFormatted).map(([day, hoursStr]) => (
                    <div key={day} className={`flex justify-between text-sm ${
                      day === currentDay ? 'font-medium text-primary' : 'text-gray-600'
                    }`}>
                      <span className="capitalize">{day}</span>
                      <span>{hoursStr}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary-dark"
                onClick={handleContactMerchant}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Merchant
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
                className="w-full text-red-500 hover:bg-red-50"
                onClick={handleReportIssue}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
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
              {merchant.website && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={merchant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
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
            // Refresh reviews
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
          <h3 className="text-lg font-semibold">Write a Review</h3>
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
              Rating for {merchant.businessName}
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
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
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
      // This would be an API call to submit the report
      // await reportsAPI.createReport(merchant._id, { type: reportType, description });
      
      // For now, just simulate the API call
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
          <h3 className="text-lg font-semibold">Report Issue</h3>
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
              What's the issue with {merchant.businessName}?
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