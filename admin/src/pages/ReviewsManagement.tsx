import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Star, 
  Trash2, 
  Calendar,
  User,
  Store,
  Filter,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';
import { Review } from '@/interfaces/ReviewsManagement';

const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, ratingFilter, statusFilter]);

  const getUserName = (user: Review['user']): string => {
    if (!user) return 'Anonymous';
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.email) return user.email;
    return 'Anonymous';
  };

  const getReviewText = (review: Review): string => {
    return review.comment || review.content || 'No comment provided';
  };

  const getMerchantName = (merchant: Review['merchant']): string => {
    return merchant?.businessName || 'Unknown Merchant';
  };

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getReviews();
      if (response.data.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(review => {
        const reviewText = getReviewText(review).toLowerCase();
        const userName = getUserName(review.user).toLowerCase();
        const merchantName = getMerchantName(review.merchant).toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return reviewText.includes(search) || 
               userName.includes(search) || 
               merchantName.includes(search);
      });
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    setFilteredReviews(filtered);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await adminAPI.deleteReview(reviewId);
      setReviews(reviews.filter(review => review._id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 sm:h-4 sm:w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status?: string, isReported?: boolean) => {
    if (isReported) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Reported</span>;
    }
    
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'hidden':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Hidden</span>;
      case 'flagged':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Flagged</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Published</span>;
    }
  };

  return (
    <div className="px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="mt-1 text-sm text-gray-700">Manage customer reviews and ratings</p>
        </div>
        <button
          onClick={loadReviews}
          className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
        {/* Mobile Filter Toggle */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showMobileFilters ? ' ▲' : ' ▼'}
          </button>
        </div>

        <div className={`grid grid-cols-1 gap-4 ${showMobileFilters ? 'block' : 'hidden'} sm:grid sm:grid-cols-1 md:grid-cols-4 sm:gap-4`}>
          {/* Search - Full width on mobile */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Reviews</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4">
          <p className="text-sm text-gray-700">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-sm text-gray-600">
              {reviews.length === 0 
                ? 'No reviews have been submitted yet.' 
                : 'No reviews match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Rating and Status Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2 space-y-1 sm:space-y-0">
                      <div className="flex items-center">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-xs sm:text-sm text-gray-600 ml-1">({review.rating}/5)</span>
                      </div>
                      <div className="sm:ml-2">
                        {getStatusBadge(review.status, review.isReported)}
                      </div>
                    </div>
                    
                    {/* Review Text */}
                    <p className="text-sm sm:text-base text-gray-900 mb-3 line-clamp-3">{getReviewText(review)}</p>
                    
                    {/* Review Meta Information */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{getUserName(review.user)}</span>
                      </div>
                      <div className="flex items-center">
                        <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{getMerchantName(review.merchant)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 ml-2 sm:ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="h-4 w-4 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsManagement;