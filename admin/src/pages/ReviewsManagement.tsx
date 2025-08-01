import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Star, 
  Trash2, 
  Eye,
  Filter,
  Calendar,
  User,
  Store
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
    email: string;
  };
  merchant: {
    businessName: string;
  };
  createdAt: string;
  isReported: boolean;
  status: 'active' | 'hidden' | 'flagged';
}

const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, ratingFilter, statusFilter]);

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
      // Mock data for demonstration
      setReviews([
        {
          _id: '1',
          rating: 5,
          comment: 'Excellent service and fresh products!',
          user: { name: 'John Doe', email: 'john@example.com' },
          merchant: { businessName: 'Green Valley Grocers' },
          createdAt: '2024-01-15T10:30:00Z',
          isReported: false,
          status: 'active'
        },
        {
          _id: '2',
          rating: 1,
          comment: 'Terrible experience, food was cold and late.',
          user: { name: 'Jane Smith', email: 'jane@example.com' },
          merchant: { businessName: 'Urban Eats' },
          createdAt: '2024-01-18T09:15:00Z',
          isReported: true,
          status: 'flagged'
        },
        {
          _id: '3',
          rating: 4,
          comment: 'Good quality products, fast delivery.',
          user: { name: 'Mike Johnson', email: 'mike@example.com' },
          merchant: { businessName: 'Tech Solutions Kenya' },
          createdAt: '2024-01-20T14:20:00Z',
          isReported: false,
          status: 'active'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string, isReported: boolean) => {
    if (isReported) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Reported</span>;
    }
    
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'hidden':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Hidden</span>;
      case 'flagged':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Flagged</span>;
      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage customer reviews and ratings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadReviews}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">No reviews match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                      {getStatusBadge(review.status, review.isReported)}
                    </div>
                    
                    <p className="text-gray-900 mb-3">{review.comment}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {review.user.name}
                      </div>
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-1" />
                        {review.merchant.businessName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Review"
                    >
                      <Trash2 className="h-4 w-4" />
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
