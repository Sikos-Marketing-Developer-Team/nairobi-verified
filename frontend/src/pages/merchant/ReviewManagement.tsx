import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MessageSquare,
  Flag,
  AlertCircle,
  CheckCircle,
  Filter,
  TrendingUp,
  Users,
  ThumbsUp
} from "lucide-react";

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  response?: {
    text: string;
    respondedAt: string;
  };
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  responseRate: number;
  flaggedReviews: number;
}

const ReviewManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<"all" | "responded" | "unresponded">("all");
  const [filterRating, setFilterRating] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");
  
  // Response modal state
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/merchants/dashboard/reviews");
      setReviews(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await axios.get("/api/merchants/dashboard/reviews/stats");
      setReviewStats(response.data.data);
    } catch (err: any) {
      console.error("Failed to load review stats:", err);
    }
  };

  const handleOpenResponseModal = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response?.text || "");
    setShowResponseModal(true);
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setSelectedReview(null);
    setResponseText("");
    setError("");
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) {
      setError("Please enter a response");
      return;
    }

    try {
      setResponding(true);
      setError("");
      setSuccess("");

      await axios.post(`/api/merchants/dashboard/reviews/${selectedReview._id}/respond`, {
        responseText: responseText.trim()
      });

      setSuccess("Response submitted successfully");
      await fetchReviews();
      await fetchReviewStats();
      handleCloseResponseModal();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit response");
    } finally {
      setResponding(false);
    }
  };

  const handleFlagReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to flag this review for admin review?")) {
      return;
    }

    try {
      await axios.post(`/api/merchants/dashboard/reviews/${reviewId}/flag`);
      setSuccess("Review flagged for admin review");
      await fetchReviews();
      await fetchReviewStats();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to flag review");
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    // Filter by response status
    if (filterStatus === "responded" && !review.response) return false;
    if (filterStatus === "unresponded" && review.response) return false;
    
    // Filter by rating
    if (filterRating !== "all" && review.rating !== parseInt(filterRating)) return false;
    
    return true;
  });

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Management</h1>
          <p className="text-gray-600 mt-1">
            Respond to customer reviews and manage feedback
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/merchant/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Review Statistics */}
      {reviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Reviews</CardDescription>
              <CardTitle className="text-3xl">{reviewStats.totalReviews}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Customer feedback</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Rating</CardDescription>
              <CardTitle className="text-3xl">{reviewStats.averageRating.toFixed(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderStars(Math.round(reviewStats.averageRating))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Response Rate</CardDescription>
              <CardTitle className="text-3xl">{reviewStats.responseRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Reviews answered</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Flagged Reviews</CardDescription>
              <CardTitle className="text-3xl">{reviewStats.flaggedReviews}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Under review</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {reviewStats && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of customer ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution];
                const percentage = reviewStats.totalReviews > 0 
                  ? (count / reviewStats.totalReviews) * 100 
                  : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="filter-status">Response Status</Label>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger id="filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="unresponded">Unresponded</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label htmlFor="filter-rating">Rating</Label>
              <Select value={filterRating} onValueChange={(value: any) => setFilterRating(value)}>
                <SelectTrigger id="filter-rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {reviews.length === 0 
                ? "You haven't received any reviews yet" 
                : "No reviews match the selected filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review._id} className={review.flagged ? "border-red-300" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{review.user.name}</CardTitle>
                      {review.flagged && (
                        <Badge variant="destructive" className="text-xs">
                          <Flag className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                      {review.response && (
                        <Badge variant="secondary" className="text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Responded
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating, "sm")}
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Review Comment */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{review.comment}</p>
                </div>

                {/* Merchant Response */}
                {review.response && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">Your Response</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(review.response.respondedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.response.text}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant={review.response ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleOpenResponseModal(review)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {review.response ? "Edit Response" : "Respond"}
                  </Button>
                  
                  {!review.flagged && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagReview(review._id)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Flag for Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={handleCloseResponseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReview?.response ? "Edit Response" : "Respond to Review"}
            </DialogTitle>
            <DialogDescription>
              Write a thoughtful response to this customer review
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Original Review */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.user.name}</span>
                  {renderStars(selectedReview.rating, "sm")}
                </div>
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>

              {/* Response Form */}
              <div>
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Thank you for your feedback..."
                  rows={6}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be professional, courteous, and address specific concerns mentioned in the review.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseResponseModal}
              disabled={responding}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitResponse} disabled={responding || !responseText.trim()}>
              {responding ? "Submitting..." : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewManagement;
