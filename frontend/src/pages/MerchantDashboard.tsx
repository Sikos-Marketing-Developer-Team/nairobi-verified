// src/pages/merchant/MerchantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  Image, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Film,
  Eye,
  Save,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { merchantsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

// Default empty merchant structure
const defaultMerchant = {
  businessName: '',
  businessType: '',
  description: '',
  yearEstablished: '',
  priceRange: '',
  address: '',
  location: '',
  latitude: '',
  longitude: '',
  phone: '',
  email: '',
  website: '',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: ''
  },
  businessHours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true }
  },
  gallery: [],
  logo: '',
  bannerImage: '',
  seoTitle: '',
  seoDescription: '',
  googleBusinessUrl: '',
  verified: false,
  verifiedDate: ''
};

const MerchantDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [needsOwnerAssignment, setNeedsOwnerAssignment] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMerchantData();
    }
  }, [isAuthenticated]);

  const fetchMerchantData = async () => {
    try {
      console.log('🔍 Fetching merchant data for user:', user);
      
      // Get all merchants and find the one owned by current user OR with matching email
      const merchantsResponse = await merchantsAPI.getMerchants();
      const merchants = merchantsResponse.data.data || [];
      
      console.log('📊 Available merchants:', merchants);
      
      // Try to find merchant by owner OR by email match
      let userMerchant = merchants.find(
        (m: any) => m.owner === user?._id || m.owner?._id === user?._id
      );
      
      // If no merchant found by owner, try by email
      if (!userMerchant) {
        userMerchant = merchants.find((m: any) => m.email === user?.email);
        if (userMerchant) {
          console.log('📧 Found merchant by email match');
          setNeedsOwnerAssignment(true);
        }
      }
      
      if (userMerchant) {
        console.log('✅ Found merchant:', userMerchant);
        setMerchant(userMerchant);
      } else {
        console.log('❌ No merchant found for user');
        setMerchant(null);
      }
    } catch (error) {
      console.error('❌ Error fetching merchant data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load merchant data',
        variant: 'destructive',
      });
      setMerchant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!merchant || !merchant._id) {
      toast({
        title: 'Error',
        description: 'No merchant ID found. Please refresh and try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Prepare data for update
      const updateData = { ...merchant };
      
      // Remove MongoDB internal fields
      delete updateData._id;
      delete updateData.__v;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      // If merchant has no owner and we need to assign one, add owner field
      if (needsOwnerAssignment && user?._id) {
        updateData.owner = user._id;
        console.log('👤 Adding owner to merchant:', user._id);
      }

      console.log('💾 Saving merchant data:', {
        merchantId: merchant._id,
        updateData,
        needsOwnerAssignment
      });

      // Use the existing updateMerchant endpoint
      const response = await merchantsAPI.updateMerchant(merchant._id, updateData);
      
      console.log('✅ Save response:', response);
      
      // If we were assigning owner, update the state
      if (needsOwnerAssignment) {
        setNeedsOwnerAssignment(false);
      }
      
      toast({
        title: 'Success',
        description: 'Merchant information updated successfully',
      });
      
      // Refresh merchant data to get any server-side updates
      fetchMerchantData();
      
    } catch (error: any) {
      console.error('❌ Error updating merchant:', error);
      
      // If we get 401 and merchant has no owner, suggest admin help
      if (error.response?.status === 401 && !merchant.owner) {
        toast({
          title: 'Ownership Issue',
          description: 'This merchant account needs to be assigned to your user account. Please contact admin support.',
          variant: 'destructive',
        });
      } else if (error.response?.status === 401) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in again to continue',
          variant: 'destructive',
        });
      } else if (error.response?.status === 403) {
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to update this merchant',
          variant: 'destructive',
        });
      } else if (error.response?.status === 404) {
        toast({
          title: 'Merchant Not Found',
          description: 'The merchant account was not found',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to update merchant information',
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (merchant?._id) {
      window.open(`/merchant/${merchant._id}`, '_blank');
    } else {
      toast({
        title: 'Info',
        description: 'Save your merchant profile first to preview it',
        variant: 'default',
      });
    }
  };

  // Temporary admin fix function
  const handleAdminFix = async () => {
    if (!merchant?._id || !user?._id) return;
    
    try {
      setSaving(true);
      console.log('🛠️ Attempting admin fix for merchant ownership');
      
      // Try to update with owner field directly
      const updateData = {
        owner: user._id,
        businessName: merchant.businessName // Include required field to avoid validation errors
      };
      
      const response = await merchantsAPI.updateMerchant(merchant._id, updateData);
      console.log('✅ Admin fix response:', response);
      
      toast({
        title: 'Success',
        description: 'Ownership assigned successfully',
      });
      
      fetchMerchantData();
      
    } catch (error: any) {
      console.error('❌ Admin fix failed:', error);
      toast({
        title: 'Fix Failed',
        description: error.response?.data?.error || 'Could not assign ownership',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access the merchant dashboard.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Merchant Account Found</h1>
            <p className="text-gray-600 mb-6">
              You don't have a merchant account associated with your profile.
            </p>
            <div className="space-y-4">
              <Button onClick={() => window.location.href = '/register/merchant'}>
                Create Merchant Account
              </Button>
              <Button variant="outline" onClick={fetchMerchantData} className="ml-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {merchant.businessName || 'Merchant Dashboard'}
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your business profile and information displayed to customers
              </p>
              {needsOwnerAssignment && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-yellow-800 text-sm">
                      <strong>Action Required:</strong> This merchant account needs to be linked to your user account.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                merchant.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {merchant.verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button onClick={handlePreview} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Profile
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={fetchMerchantData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          {/* Show admin fix button if merchant has no owner */}
          {!merchant.owner && (
            <Button variant="outline" onClick={handleAdminFix} disabled={saving}>
              <Settings className="h-4 w-4 mr-2" />
              Fix Ownership
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact & Social</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="seo">SEO & Settings</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <BasicInfoTab merchant={merchant} setMerchant={setMerchant} />
          </TabsContent>

          {/* Contact & Social Tab */}
          <TabsContent value="contact">
            <ContactSocialTab merchant={merchant} setMerchant={setMerchant} />
          </TabsContent>

          {/* Business Hours Tab */}
          <TabsContent value="hours">
            <BusinessHoursTab merchant={merchant} setMerchant={setMerchant} />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <GalleryTab merchant={merchant} setMerchant={setMerchant} />
          </TabsContent>

          {/* SEO & Settings Tab */}
          <TabsContent value="seo">
            <SEOSettingsTab merchant={merchant} setMerchant={setMerchant} />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

// Basic Information Tab Component with null checks
const BasicInfoTab = ({ merchant, setMerchant }: { merchant: any; setMerchant: any }) => {
  const updateField = (field: string, value: any) => {
    setMerchant((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Safe access with fallbacks
  const businessName = merchant?.businessName || '';
  const businessType = merchant?.businessType || '';
  const description = merchant?.description || '';
  const yearEstablished = merchant?.yearEstablished || '';
  const priceRange = merchant?.priceRange || '';
  const address = merchant?.address || '';
  const location = merchant?.location || '';
  const latitude = merchant?.latitude || '';
  const longitude = merchant?.longitude || '';

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Basic details about your business that customers will see first
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your business name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                value={businessType}
                onChange={(e) => updateField('businessType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select business type</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Retail">Retail</option>
                <option value="Service">Service</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe your business, services, and what makes you unique..."
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Established
              </label>
              <input
                type="number"
                value={yearEstablished}
                onChange={(e) => updateField('yearEstablished', parseInt(e.target.value) || '')}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => updateField('priceRange', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select price range</option>
                <option value="$">$ - Budget</option>
                <option value="$$">$$ - Moderate</option>
                <option value="$$$">$$$ - Expensive</option>
                <option value="$$$$">$$$$ - Luxury</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Street address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location/City *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => updateField('latitude', parseFloat(e.target.value) || '')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., 40.7128"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => updateField('longitude', parseFloat(e.target.value) || '')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Contact & Social Tab Component with null checks
const ContactSocialTab = ({ merchant, setMerchant }: { merchant: any; setMerchant: any }) => {
  const updateField = (field: string, value: any) => {
    setMerchant((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSocialLinks = (platform: string, url: string) => {
    setMerchant((prev: any) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: url
      }
    }));
  };

  // Safe access with fallbacks
  const phone = merchant?.phone || '';
  const email = merchant?.email || '';
  const website = merchant?.website || '';
  const socialLinks = merchant?.socialLinks || {};

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            How customers can get in touch with your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="contact@business.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media & Online Presence</CardTitle>
          <CardDescription>
            Connect your social media profiles to increase engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Facebook className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={socialLinks.facebook || ''}
                  onChange={(e) => updateSocialLinks('facebook', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://facebook.com/yourbusiness"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Instagram className="h-5 w-5 text-pink-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={socialLinks.instagram || ''}
                  onChange={(e) => updateSocialLinks('instagram', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://instagram.com/yourbusiness"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Twitter className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={socialLinks.twitter || ''}
                  onChange={(e) => updateSocialLinks('twitter', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://twitter.com/yourbusiness"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Film className="h-5 w-5 text-black" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TikTok
                </label>
                <input
                  type="url"
                  value={socialLinks.tiktok || ''}
                  onChange={(e) => updateSocialLinks('tiktok', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://tiktok.com/@yourbusiness"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Business Hours Tab Component with null checks
const BusinessHoursTab = ({ merchant, setMerchant }: { merchant: any; setMerchant: any }) => {
  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const updateBusinessHours = (day: string, field: string, value: any) => {
    setMerchant((prev: any) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours?.[day],
          [field]: value
        }
      }
    }));
  };

  const setClosed = (day: string, closed: boolean) => {
    setMerchant((prev: any) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours?.[day],
          closed
        }
      }
    }));
  };

  // Safe access with fallbacks
  const businessHours = merchant?.businessHours || defaultMerchant.businessHours;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>
          Set your operating hours. Customers will see if you're currently open or closed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24">
                <label className="font-medium text-gray-700 capitalize">
                  {dayLabels[day as keyof typeof dayLabels]}
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!businessHours[day]?.closed}
                  onChange={(e) => setClosed(day, !e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Open</span>
              </div>

              {!businessHours[day]?.closed && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={businessHours[day]?.open || '09:00'}
                    onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={businessHours[day]?.close || '17:00'}
                    onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {businessHours[day]?.closed && (
                <span className="text-red-500 font-medium">Closed</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Gallery Tab Component with null checks
const GalleryTab = ({ merchant, setMerchant }: { merchant: any; setMerchant: any }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file || !merchant?._id) return;

    try {
      setUploading(true);
      
      if (type === 'logo') {
        await merchantsAPI.uploadLogo(merchant._id, file);
        // Update local state with new logo URL
        const objectUrl = URL.createObjectURL(file);
        setMerchant((prev: any) => ({ ...prev, logo: objectUrl }));
      } else if (type === 'banner') {
        await merchantsAPI.uploadBanner(merchant._id, file);
        const objectUrl = URL.createObjectURL(file);
        setMerchant((prev: any) => ({ ...prev, bannerImage: objectUrl }));
      } else {
        await merchantsAPI.uploadGallery(merchant._id, [file]);
        const objectUrl = URL.createObjectURL(file);
        setMerchant((prev: any) => ({ 
          ...prev, 
          gallery: [...(prev.gallery || []), objectUrl] 
        }));
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = async (index: number) => {
    if (!merchant?._id) return;
    
    try {
      // Note: You might need to implement a deleteGalleryImage endpoint
      // For now, we'll just update the local state
      setMerchant((prev: any) => ({
        ...prev,
        gallery: (prev.gallery || []).filter((_: any, i: number) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  // Safe access with fallbacks
  const logo = merchant?.logo || '';
  const bannerImage = merchant?.bannerImage || '';
  const gallery = merchant?.gallery || [];

  return (
    <div className="grid gap-6">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
          <CardDescription>
            Your logo appears on your profile and in search results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {logo ? (
                <img
                  src={logo}
                  alt="Business logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="logo-upload">
                <Button variant="outline" disabled={uploading}>
                  <Image className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Recommended: 500x500px, PNG or JPG
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Image</CardTitle>
          <CardDescription>
            This large image appears at the top of your profile page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {bannerImage ? (
                <img
                  src={bannerImage}
                  alt="Business banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              id="banner-upload"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'banner')}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="banner-upload">
              <Button variant="outline" disabled={uploading}>
                <Image className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Banner'}
              </Button>
            </label>
            <p className="text-sm text-gray-500">
              Recommended: 1200x400px, PNG or JPG
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>
            Showcase your business with multiple photos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {gallery.map((image: string, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeGalleryImage(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {/* Add New Image */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-32">
              <input
                type="file"
                id="gallery-upload"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'gallery')}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="gallery-upload" className="cursor-pointer">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Add Photo</span>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// SEO & Settings Tab Component with null checks
const SEOSettingsTab = ({ merchant, setMerchant }: { merchant: any; setMerchant: any }) => {
  const updateField = (field: string, value: any) => {
    setMerchant((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Safe access with fallbacks
  const seoTitle = merchant?.seoTitle || `${merchant?.businessName || ''} - ${merchant?.businessType || ''}`;
  const seoDescription = merchant?.seoDescription || (merchant?.description || '').substring(0, 160);
  const googleBusinessUrl = merchant?.googleBusinessUrl || '';

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>
            Optimize how your business appears in search results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => updateField('seoTitle', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Optimized title for search engines"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={seoDescription}
              onChange={(e) => updateField('seoDescription', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Brief description that appears in search results"
              maxLength={160}
            />
            <p className="text-sm text-gray-500 mt-1">
              {seoDescription.length}/160 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Business Profile URL
            </label>
            <input
              type="url"
              value={googleBusinessUrl}
              onChange={(e) => updateField('googleBusinessUrl', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://g.page/your-business"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loading Skeleton
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          <Skeleton className="h-12 w-full" />
          
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MerchantDashboard;