import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Phone,
  MessageCircle,
  Globe,
  Navigation,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";

interface EngagementStats {
  profileViews: {
    total: number;
    trend: "up" | "down" | "stable";
    percentageChange: number;
    byPeriod: Array<{ date: string; count: number }>;
  };
  whatsappClicks: {
    total: number;
    trend: "up" | "down" | "stable";
    percentageChange: number;
    byPeriod: Array<{ date: string; count: number }>;
  };
  callClicks: {
    total: number;
    trend: "up" | "down" | "stable";
    percentageChange: number;
    byPeriod: Array<{ date: string; count: number }>;
  };
  websiteClicks: {
    total: number;
    trend: "up" | "down" | "stable";
    percentageChange: number;
    byPeriod: Array<{ date: string; count: number }>;
  };
  directionsClicks: {
    total: number;
    trend: "up" | "down" | "stable";
    percentageChange: number;
    byPeriod: Array<{ date: string; count: number }>;
  };
}

interface MetricCardProps {
  title: string;
  total: number;
  trend: "up" | "down" | "stable";
  percentageChange: number;
  icon: React.ReactNode;
  color: string;
}

const CustomerEngagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchEngagementStats();
  }, [timeRange]);

  const fetchEngagementStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/merchants/dashboard/engagement/stats", {
        params: { timeRange }
      });
      setStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load engagement stats");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "stable":
        return "text-gray-600";
    }
  };

  const MetricCard: React.FC<MetricCardProps> = ({
    title,
    total,
    trend,
    percentageChange,
    icon,
    color
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm">{title}</CardDescription>
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <CardTitle className="text-3xl">{total.toLocaleString()}</CardTitle>
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              {percentageChange > 0 && "+"}
              {percentageChange.toFixed(1)}%
            </div>
          </div>
          <p className="text-xs text-gray-500">
            vs previous {timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const SimpleBarChart = ({ data, color }: { data: Array<{ date: string; count: number }>; color: string }) => {
    if (!data || data.length === 0) return null;

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
      <div className="flex items-end justify-between gap-1 h-32">
        {data.map((item, idx) => {
          const height = (item.count / maxCount) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full ${color} rounded-t transition-all hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`${new Date(item.date).toLocaleDateString()}: ${item.count}`}
                />
              </div>
              <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const totalEngagement = stats
    ? stats.profileViews.total +
      stats.whatsappClicks.total +
      stats.callClicks.total +
      stats.websiteClicks.total +
      stats.directionsClicks.total
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Engagement</h1>
          <p className="text-gray-600 mt-1">
            Track how customers interact with your business
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate("/merchant/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Total Engagement Overview */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Total Customer Interactions
          </CardTitle>
          <CardDescription>All engagement metrics combined</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-blue-600">
            {totalEngagement.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            interactions in the last {timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"}
          </p>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Profile Views"
            total={stats.profileViews.total}
            trend={stats.profileViews.trend}
            percentageChange={stats.profileViews.percentageChange}
            icon={<Eye className="h-5 w-5 text-blue-600" />}
            color="bg-blue-100"
          />

          <MetricCard
            title="WhatsApp Clicks"
            total={stats.whatsappClicks.total}
            trend={stats.whatsappClicks.trend}
            percentageChange={stats.whatsappClicks.percentageChange}
            icon={<MessageCircle className="h-5 w-5 text-green-600" />}
            color="bg-green-100"
          />

          <MetricCard
            title="Call Clicks"
            total={stats.callClicks.total}
            trend={stats.callClicks.trend}
            percentageChange={stats.callClicks.percentageChange}
            icon={<Phone className="h-5 w-5 text-purple-600" />}
            color="bg-purple-100"
          />

          <MetricCard
            title="Website Clicks"
            total={stats.websiteClicks.total}
            trend={stats.websiteClicks.trend}
            percentageChange={stats.websiteClicks.percentageChange}
            icon={<Globe className="h-5 w-5 text-orange-600" />}
            color="bg-orange-100"
          />

          <MetricCard
            title="Directions Clicks"
            total={stats.directionsClicks.total}
            trend={stats.directionsClicks.trend}
            percentageChange={stats.directionsClicks.percentageChange}
            icon={<Navigation className="h-5 w-5 text-red-600" />}
            color="bg-red-100"
          />

          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">Engagement Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl">
                {stats.profileViews.total > 0
                  ? (
                      ((stats.whatsappClicks.total +
                        stats.callClicks.total +
                        stats.websiteClicks.total +
                        stats.directionsClicks.total) /
                        stats.profileViews.total) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </CardTitle>
              <p className="text-xs text-gray-500 mt-2">
                Actions per profile view
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Engagement Trends Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Profile Views Trend
              </CardTitle>
              <CardDescription>Daily profile views over time</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={stats.profileViews.byPeriod} color="bg-blue-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                WhatsApp Clicks Trend
              </CardTitle>
              <CardDescription>Daily WhatsApp engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={stats.whatsappClicks.byPeriod} color="bg-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-purple-600" />
                Call Clicks Trend
              </CardTitle>
              <CardDescription>Daily call button clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={stats.callClicks.byPeriod} color="bg-purple-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-600" />
                Website Clicks Trend
              </CardTitle>
              <CardDescription>Daily website visits</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={stats.websiteClicks.byPeriod} color="bg-orange-500" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights and Tips */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Engagement Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats && stats.profileViews.total > 0 && (
            <>
              {stats.profileViews.trend === "up" && (
                <Alert className="border-green-500 bg-green-50">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Great news!</strong> Your profile views are up {Math.abs(stats.profileViews.percentageChange).toFixed(1)}% compared to the previous period. Keep your profile updated to maintain this momentum.
                  </AlertDescription>
                </Alert>
              )}

              {stats.whatsappClicks.total / stats.profileViews.total > 0.3 && (
                <Alert className="border-blue-500 bg-blue-50">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>High WhatsApp engagement!</strong> {((stats.whatsappClicks.total / stats.profileViews.total) * 100).toFixed(0)}% of viewers contact you via WhatsApp. Consider adding more product info to your WhatsApp Business profile.
                  </AlertDescription>
                </Alert>
              )}

              {stats.directionsClicks.total / stats.profileViews.total > 0.2 && (
                <Alert className="border-orange-500 bg-orange-50">
                  <Navigation className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>High foot traffic potential!</strong> {((stats.directionsClicks.total / stats.profileViews.total) * 100).toFixed(0)}% of viewers request directions. Make sure your business hours are up to date.
                  </AlertDescription>
                </Alert>
              )}

              {(stats.whatsappClicks.total + stats.callClicks.total) / stats.profileViews.total < 0.1 && (
                <Alert className="border-yellow-500 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Boost engagement:</strong> Only {(((stats.whatsappClicks.total + stats.callClicks.total) / stats.profileViews.total) * 100).toFixed(0)}% of viewers contact you. Try adding more photos, products, and customer reviews to encourage engagement.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {(!stats || stats.profileViews.total === 0) && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                No engagement data available yet. Make sure your business profile is complete and share your listing link to start tracking customer interactions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Improve Your Engagement</CardTitle>
          <CardDescription>Actionable tips to increase customer interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <p className="font-medium">Complete your profile</p>
                <p className="text-gray-600">Add business hours, photos, products, and social media links</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <p className="font-medium">Respond to reviews</p>
                <p className="text-gray-600">Engage with customers who leave reviews to build trust</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <p className="font-medium">Upload quality photos</p>
                <p className="text-gray-600">High-quality images increase profile views and engagement</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <p className="font-medium">Get verified</p>
                <p className="text-gray-600">Verified businesses get 3x more engagement than unverified ones</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                5
              </div>
              <div>
                <p className="font-medium">Share your listing</p>
                <p className="text-gray-600">Promote your Nairobi Verified listing on social media and your website</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerEngagement;
