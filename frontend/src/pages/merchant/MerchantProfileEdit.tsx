import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const MerchantProfileEdit = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    businessType: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    website: '',
    address: '',
    location: '',
    landmark: '',
    yearEstablished: '',
  });

  const [businessHours, setBusinessHours] = useState<any>({});
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  });

  const [logo, setLogo] = useState('');
  const [banner, setBanner] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'merchant') {
      navigate('/merchant/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/merchants/dashboard/profile`, {
        withCredentials: true
      });

      if (response.data.success) {
        const profile = response.data.data;
        setFormData({
          businessName: profile.businessName || '',
          description: profile.description || '',
          businessType: profile.businessType || '',
          phone: profile.phone || '',
          whatsappNumber: profile.whatsappNumber || '',
          email: profile.email || '',
          website: profile.website || '',
          address: profile.address || '',
          location: profile.location || '',
          landmark: profile.landmark || '',
          yearEstablished: profile.yearEstablished || '',
        });
        setBusinessHours(profile.businessHours || {});
        setSocialLinks(profile.socialLinks || {});
        setLogo(profile.logo || '');
        setBanner(profile.bannerImage || '');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks({
      ...socialLinks,
      [e.target.name]: e.target.value
    });
  };

  const handleBusinessHourChange = (day: string, field: string, value: string) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('logo', file);

    try {
      setUploadingLogo(true);
      const response = await axios.post(
        `${API_BASE_URL}/merchants/dashboard/profile/logo`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        setLogo(response.data.data.logo);
        toast({
          title: 'Success',
          description: 'Logo uploaded successfully'
        });
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload logo',
        variant: 'destructive'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('banner', file);

    try {
      setUploadingBanner(true);
      const response = await axios.post(
        `${API_BASE_URL}/merchants/dashboard/profile/banner`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        setBanner(response.data.data.banner);
        toast({
          title: 'Success',
          description: 'Banner uploaded successfully'
        });
      }
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload banner',
        variant: 'destructive'
      });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      // Update basic profile
      await axios.put(
        `${API_BASE_URL}/merchants/dashboard/profile`,
        formData,
        { withCredentials: true }
      );

      // Update business hours
      await axios.put(
        `${API_BASE_URL}/merchants/dashboard/profile/hours`,
        { businessHours },
        { withCredentials: true }
      );

      // Update social links
      await axios.put(
        `${API_BASE_URL}/merchants/dashboard/profile/social`,
        { socialLinks },
        { withCredentials: true }
      );

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });

      navigate('/merchant/dashboard');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Business Profile</h1>
          <p className="text-gray-600">Update your business information and settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo and Banner */}
          <Card>
            <CardHeader>
              <CardTitle>Business Images</CardTitle>
              <CardDescription>Upload your logo and banner image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div>
                <Label>Business Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  {logo && (
                    <img src={logo} alt="Logo" className="h-20 w-20 object-cover rounded-lg border" />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="max-w-xs"
                    />
                    {uploadingLogo && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div>
                <Label>Banner Image</Label>
                <div className="mt-2">
                  {banner && (
                    <img src={banner} alt="Banner" className="w-full h-32 object-cover rounded-lg border mb-2" />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="max-w-xs"
                  />
                  {uploadingBanner && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name*</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type*</Label>
                  <Input
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  placeholder="Tell customers about your business..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input
                    id="yearEstablished"
                    name="yearEstablished"
                    type="number"
                    value={formData.yearEstablished}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number*</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    placeholder="254..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where your business is located</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address*</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location/Area*</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Near..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>When your business is open</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DAYS.map(day => (
                <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label className="capitalize">{day}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={businessHours[day]?.open || ''}
                      onChange={(e) => handleBusinessHourChange(day, 'open', e.target.value)}
                      disabled={businessHours[day]?.closed}
                      placeholder="Open"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <Input
                      type="time"
                      value={businessHours[day]?.close || ''}
                      onChange={(e) => handleBusinessHourChange(day, 'close', e.target.value)}
                      disabled={businessHours[day]?.closed}
                      placeholder="Close"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={businessHours[day]?.closed || false}
                      onChange={(e) => handleBusinessHourChange(day, 'closed', e.target.checked.toString())}
                      className="rounded"
                    />
                    <span className="text-sm">Closed</span>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={socialLinks.facebook}
                    onChange={handleSocialLinkChange}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={socialLinks.instagram}
                    onChange={handleSocialLinkChange}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={socialLinks.twitter}
                    onChange={handleSocialLinkChange}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={socialLinks.linkedin}
                    onChange={handleSocialLinkChange}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/merchant/dashboard')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default MerchantProfileEdit;
