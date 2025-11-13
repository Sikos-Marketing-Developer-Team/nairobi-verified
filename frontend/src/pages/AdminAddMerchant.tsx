
import React, { useState } from 'react';
import { ArrowLeft, Upload, MapPin, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/api';

const AdminAddMerchant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    category: '',
    address: '',
    description: '',
    website: '',
    verificationStatus: 'verified'
  });

  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true }
  });

  const categories = [
    'Electronics', 'Fashion & Apparel', 'Healthcare', 'Food & Beverages',
    'Beauty & Personal Care', 'Books & Stationery', 'Home & Garden',
    'Sports & Recreation', 'Automotive', 'Services', 'Other'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleHoursChange = (day, field, value) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      // Prepare the data for API
      const merchantData = {
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        businessType: formData.category,
        description: formData.description || `${formData.businessName} - Business description to be updated`,
        website: formData.website,
        address: formData.address,
        location: formData.address,
        businessHours: businessHours,
        verificationStatus: formData.verificationStatus,
        yearEstablished: new Date().getFullYear()
      };

      const response = await fetch(`${API_URL}/merchants/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(merchantData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create merchant account');
      }

      // Success! Show the credentials
      setSuccess({
        merchant: data.data,
        credentials: data.credentials,
        message: data.message
      });

      toast({
        title: "✅ Merchant Account Created!",
        description: `Welcome email sent to ${data.data.email}`,
      });

      // Reset form
      setFormData({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        category: '',
        address: '',
        description: '',
        website: '',
        verificationStatus: 'verified'
      });

    } catch (error) {
      console.error('Error creating merchant:', error);
      setError(error.message || 'Failed to create merchant account');
      
      toast({
        title: "❌ Error",
        description: error.message || 'Failed to create merchant account',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/admin/merchants">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Merchants
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Merchant</h1>
          <p className="text-gray-600 mt-2">Create a new merchant account manually</p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Merchant Account Created Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Account Details:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Business:</strong> {success.merchant.businessName}</p>
                  <p><strong>Email:</strong> {success.merchant.email}</p>
                  <p><strong>Status:</strong> {success.merchant.verified ? '✅ Verified' : '⏳ Pending Verification'}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Login Credentials:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Email:</strong> {success.credentials.email}</p>
                  <p><strong>Temp Password:</strong> <code className="bg-white px-2 py-1 rounded text-red-600 font-mono">{success.credentials.tempPassword}</code></p>
                  <p className="text-blue-600 mt-2">📧 Welcome email sent with setup instructions</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setSuccess(null)} 
                  variant="outline"
                  size="sm"
                >
                  Create Another Merchant
                </Button>
                <Link to="/admin/merchants">
                  <Button size="sm">
                    View All Merchants
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" style={{ display: success ? 'none' : 'block' }}>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <Input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <Input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status
                  </label>
                  <select
                    name="verificationStatus"
                    value={formData.verificationStatus}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Describe the business and services offered..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Address *
                </label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address in Nairobi CBD"
                  required
                />
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Map for location selection will be displayed here</p>
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
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-20">
                      <span className="capitalize font-medium">{day}</span>
                    </div>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                        className="mr-2"
                      />
                      Closed
                    </label>
                    
                    {!hours.closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          className="p-2 border border-gray-300 rounded"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          className="p-2 border border-gray-300 rounded"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Documents (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload verification documents</p>
                    <p className="text-sm text-gray-500">Business registration, ID, utility bills, etc.</p>
                    <Button variant="outline" className="mt-4">
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Merchant Account'
              )}
            </Button>
            <Link to="/admin/merchants">
              <Button variant="outline" disabled={loading}>Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddMerchant;
