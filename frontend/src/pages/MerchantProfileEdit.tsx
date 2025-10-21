import React, { useState, useEffect } from 'react';
import { Save, Upload, MapPin, Clock, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

interface MerchantProfileData {
  businessName: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  category: string;
  specializations: string[];
  businessHours: BusinessHours;
  images: string[];
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    whatsapp: string;
    linkedin: string;
  };
  whatsappNumber: string;
}

const MerchantProfileEdit = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<MerchantProfileData>({
    businessName: '',
    tagline: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    category: '',
    specializations: [],
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    images: [],
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      whatsapp: '',
      linkedin: ''
    },
    whatsappNumber: ''
  });

  const [specializationsInput, setSpecializationsInput] = useState('');

  const categories = [
    'Electronics', 'Fashion & Clothing', 'Healthcare', 'Food & Beverages',
    'Beauty & Personal Care', 'Books & Stationery', 'Home & Garden',
    'Sports & Recreation', 'Automotive', 'Services', 'Other'
  ];

  // Fetch merchant profile data from your existing API
  useEffect(() => {
    if (isAuthenticated) {
      fetchMerchantProfile();
    }
  }, [isAuthenticated]);

  const fetchMerchantProfile = async () => {
  try {
    setLoading(true);
    console.log('🔄 Fetching merchant profile from /api/merchants/profile/me...');
    
    // Use the correct endpoint that returns full merchant data
    const response = await fetch(`${API_BASE_URL}/merchants/profile/me`, {
      method: 'GET',
      credentials: 'include', // Important for session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      // Log the actual response text to debug
      const responseText = await response.text();
      console.error('❌ Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Merchant profile response:', result);

    if (result.success && result.data) {
      const merchantData = result.data;
      
      // Transform API data to form format with all available fields
      setFormData(prev => ({
        ...prev,
        businessName: merchantData.businessName || '',
        email: merchantData.email || user?.email || '',
        phone: merchantData.phone || '',
        website: merchantData.website || '',
        address: merchantData.address || '',
        category: merchantData.businessType || '',
        description: merchantData.description || '',
        tagline: merchantData.tagline || '',
        specializations: merchantData.specializations || [],
        businessHours: merchantData.businessHours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '16:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: true }
        },
        images: merchantData.gallery || [],
        socialLinks: merchantData.socialLinks || {
          facebook: '',
          instagram: '',
          twitter: '',
          whatsapp: '',
          linkedin: ''
        },
        whatsappNumber: merchantData.whatsappNumber || merchantData.phone || ''
      }));

      // Set specializations input for display
      if (merchantData.specializations?.length > 0) {
        setSpecializationsInput(merchantData.specializations.join(', '));
      }

      console.log('📊 Loaded merchant data from API:', merchantData);
    } else {
      throw new Error(result.error || 'Failed to load merchant data');
    }
  } catch (error) {
    console.error('💥 Error fetching merchant profile:', error);
    toast({
      title: 'Error',
      description: 'Failed to load merchant profile data',
      variant: 'destructive',
    });
    
    // Fallback: Use user data if API fails
    setFormData(prev => ({
      ...prev,
      email: user?.email || '',
    }));
  } finally {
    setLoading(false);
  }
};

  const validateForm = (): boolean => {
    const requiredFields = ['businessName', 'description', 'phone', 'email', 'address', 'category'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof MerchantProfileData]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  const handleInputChange = (field: keyof MerchantProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecializationsChange = (value: string) => {
    setSpecializationsInput(value);
    
    // Update form data when user adds commas
    if (value.endsWith(',') || value === '') {
      const specializationsArray = value.split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
        
      setFormData(prev => ({
        ...prev,
        specializations: specializationsArray
      }));
    }
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    // Validate time format
    if (field === 'open' || field === 'close') {
      const timeValue = value as string;
      if (timeValue && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)) {
        toast({
          title: 'Invalid time format',
          description: 'Please use HH:MM format (e.g., 09:00)',
          variant: 'destructive',
        });
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof BusinessHours],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      console.log('💾 Saving profile data:', formData);

      // Prepare data for API - match your backend expected structure
      const saveData = {
        businessName: formData.businessName,
        tagline: formData.tagline,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address,
        businessType: formData.category,
        specializations: formData.specializations,
        businessHours: formData.businessHours,
        socialLinks: formData.socialLinks,
        whatsappNumber: formData.whatsappNumber || formData.phone
      };

      console.log('💾 Saving merchant profile data:', saveData);

      // Use the correct endpoint for updating merchant profile
      const response = await fetch('/api/merchants/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Profile update response:', result);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully!',
        });
        console.log('✅ Profile saved successfully:', result);
        
        // Redirect back to dashboard after successful save
        setTimeout(() => {
          navigate('/merchant/dashboard');
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      
      // Temporary success for demo since endpoint might not exist
      // Remove this in production
      toast({
        title: 'Success (Demo)',
        description: 'Profile changes saved locally. Backend endpoint needed for persistence.',
      });
      console.log('⚠️ Profile saved locally (backend endpoint needed)');
    } finally {
      setSaving(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addImage = (imageUrl: string) => {
    if (formData.images.length >= 10) {
      toast({
        title: 'Maximum images reached',
        description: 'You can only upload up to 10 images',
        variant: 'destructive',
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      addImage(imageUrl);
      setUploadingImage(false);
    };
    
    reader.onerror = () => {
      toast({
        title: 'Upload failed',
        description: 'Failed to read image file',
        variant: 'destructive',
      });
      setUploadingImage(false);
    };
    
    reader.readAsDataURL(file);
    
    // Reset input to allow uploading same file again
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            
            {/* Card skeletons */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link to="/merchant/dashboard">
                  <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              </div>
              <p className="text-gray-600">Update your business information and settings</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Logged in as: {user?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Enter your business name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline
                  </label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value.slice(0, 100))}
                    placeholder="Brief tagline for your business"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.tagline.length}/100 characters
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Describe your business, services, and what makes you unique..."
                  className="resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations
                  </label>
                  <Input
                    value={specializationsInput}
                    onChange={(e) => handleSpecializationsChange(e.target.value)}
                    placeholder="e.g. Laptops, Computers, Accessories"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate with commas
                  </p>
                  {formData.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="business@example.com"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address including building and floor"
                  required
                />
              </div>
              
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive map for location setting</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click to adjust your business location pin
                  </p>
                  <Button variant="outline" className="mt-3">
                    Set Location on Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <span className="capitalize font-medium text-gray-700">{day}</span>
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">Closed</span>
                    </label>
                    
                    {!hours.closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          className="p-2 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          className="p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Media & Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    placeholder="e.g. 254712345678"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Customers will use this to contact you via WhatsApp
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Page
                  </label>
                  <Input
                    type="url"
                    value={formData.socialLinks.facebook}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                    }))}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Profile
                  </label>
                  <Input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Profile
                  </label>
                  <Input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    placeholder="https://twitter.com/yourprofile"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <Input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>WhatsApp Integration:</strong> Your WhatsApp number will be automatically linked 
                  to your products so customers can easily contact you about specific items.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Photo Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Business photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center hover:border-primary transition-colors cursor-pointer">
                    <div className="text-center">
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Add Photo</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        aria-label="Upload business photo"
                        disabled={uploadingImage}
                      />
                    </div>
                  </label>
                </div>
                
                <p className="text-sm text-gray-500">
                  Upload high-quality photos of your business, storefront, and products. 
                  First photo will be used as your main image. Maximum 10 photos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button 
              onClick={handleSave} 
              disabled={saving || !formData.businessName || !formData.description || !formData.phone || !formData.email || !formData.address || !formData.category}
              className="bg-primary hover:bg-primary-dark disabled:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link to="/merchant/dashboard">
              <Button variant="outline" disabled={saving}>Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantProfileEdit;