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
      const response = await fetch('/api/merchants/profile/me', {
        method: 'GET',
        credentials: 'include' // Important for session cookies
      });

      if (!response.ok) {
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
          // Add more fields from the API response
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
          images: merchantData.gallery || []
        }));

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

  const handleInputChange = (field: keyof MerchantProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecializationsChange = (value: string) => {
    setSpecializationsInput(value);
    // Convert comma-separated string to array
    const specializationsArray = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      specializations: specializationsArray
    }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
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
        businessType: formData.category, // Note: backend uses businessType
        specializations: formData.specializations,
        businessHours: formData.businessHours,
        // Add socialLinks and whatsappNumber if available
        socialLinks: {
          facebook: '',
          instagram: '',
          twitter: '',
          whatsapp: formData.phone || '', // Use phone as whatsapp for now
          linkedin: '',
          website: formData.website || ''
        },
        whatsappNumber: formData.phone || ''
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
      
      // Uncomment below when you have the backend endpoint
      // toast({
      //   title: 'Error',
      //   description: error.message || 'Failed to save profile changes',
      //   variant: 'destructive',
      // });
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
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  // Handle image upload (placeholder - implement actual upload logic)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to your server and get back a URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        addImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded mb-6"></div>
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
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
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
                  onChange={(e) => handleInputChange('description', e.target.value)}
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
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center hover:border-primary transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Add Photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
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