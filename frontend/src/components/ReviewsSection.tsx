// src/components/ReviewsSection.tsx
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { reviewsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Review = {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  merchant: string;
  rating: number;
  content: string;
  createdAt: string;
  helpful: number;
  helpfulBy: string[];
  reply?: {
    author: string;
    content: string;
    date: string;
  };
};

type ReviewsSectionProps = {
  merchantId: string;
  reviews: Review[];
};

const ReviewsSection = ({ merchantId, reviews: initialReviews }: ReviewsSectionProps) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Fetch reviews if not provided or invalid merchantId
  useEffect(() => {
    if (!merchantId || merchantId === 'undefined') {
      setReviews([]);
      toast({
        title: 'Error',
        description: 'Invalid merchant ID',
        variant: 'destructive',
      });
      return;
    }

    if (!initialReviews || initialReviews.length === 0) {
      fetchReviews();
    }
  }, [merchantId, initialReviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getReviews(merchantId);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;
  
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });
  
  const handleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to mark reviews as helpful',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(reviewId);
      await reviewsAPI.markHelpful(reviewId);
      
      // Update local state
      setReviews(reviews.map(review => {
        if (review._id === reviewId) {
          const isAlreadyHelpful = review.helpfulBy.includes(user?.id || '');
          return {
            ...review,
            helpful: isAlreadyHelpful ? review.helpful - 1 : review.helpful + 1,
            helpfulBy: isAlreadyHelpful 
              ? review.helpfulBy.filter(id => id !== user?.id)
              : [...review.helpfulBy, user?.id || '']
          };
        }
        return review;
      }));
      
      setActionLoading(null);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark review as helpful',
        variant: 'destructive',
      });
      setActionLoading(null);
    }
  };
  
  const handleReply = (reviewId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to reply to reviews',
        variant: 'destructive',
      });
      return;
    }
    
    setReplyingTo(reviewId);
    setShowReplyDialog(true);
  };
  
  const submitReply = async () => {
    if (!replyText.trim() || replyingTo === null) return;
    
    try {
      setActionLoading(replyingTo);
      await reviewsAPI.addReply(replyingTo, { content: replyText });
      
      // Update local state
      setReviews(reviews.map(review => {
        if (review._id === replyingTo) {
          return {
            ...review,
            reply: {
              author: 'Business Owner',
              date: new Date().toISOString(),
              content: replyText
            }
          };
        }
        return review;
      }));
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully",
      });
      
      setReplyText('');
      setReplyingTo(null);
      setShowReplyDialog(false);
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleReport = (reviewId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to report reviews',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: "Review reported",
      description: "Thank you for reporting this review. We will review it shortly.",
    });
  };
  
  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Rating Summary */}
        <Card className="md:w-1/3">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Customer Reviews</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">Based on {reviews.length} reviews</p>
              
              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingCounts.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="w-12 text-sm font-medium">{rating} stars</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-xs text-gray-500">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Reviews List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">All Reviews</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'lowest')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <Card key={review._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {review.user.avatar ? (
                            <img src={review.user.avatar} alt={`${review.user.firstName} ${review.user.lastName}`} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-medium text-gray-600">
                              {review.user.firstName.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{review.user.firstName} {review.user.lastName}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center mt-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          
                          <p className="text-gray-700 mb-3">{review.content}</p>
                          
                          <div className="flex items-center gap-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`text-xs ${review.helpfulBy.includes(user?.id || '') ? 'text-primary' : 'text-gray-500'}`}
                              onClick={() => handleHelpful(review._id)}
                              disabled={actionLoading === review._id}
                            >
                              {actionLoading === review._id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-3 w-3 mr-1" />
                              )}
                              Helpful ({review.helpful})
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs text-gray-500"
                              onClick={() => handleReply(review._id)}
                              disabled={actionLoading === review._id}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs text-gray-500"
                              onClick={() => handleReport(review._id)}
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Business Reply */}
                    {review.reply && (
                      <div className="bg-gray-50 p-4 border-t">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {review.reply.author.charAt(0)}
                            </span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-medium text-primary">{review.reply.author}</h5>
                              <span className="text-xs text-gray-500">
                                {new Date(review.reply.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{review.reply.content}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {replyingTo !== null && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">
                  {reviews.find(r => r._id === replyingTo)?.content}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Reply
              </label>
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Write your reply here..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitReply} 
              disabled={!replyText.trim() || actionLoading === replyingTo}
            >
              {actionLoading === replyingTo ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Reply'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsSection;