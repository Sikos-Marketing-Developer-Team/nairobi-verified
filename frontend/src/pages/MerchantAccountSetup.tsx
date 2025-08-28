import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/api';

const MerchantAccountSetup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    description: '',
    website: ''
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load merchant info on component mount
  useEffect(() => {
    if (token) {
      fetchMerchantInfo();
    }
  }, [token]);

  const fetchMerchantInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/merchants/setup/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid or expired setup link');
      }

      setMerchantInfo(data.data);
      
      // Pre-fill form if merchant has existing data
      if (data.data.description) {
        setFormData(prev => ({ ...prev, description: data.data.description }));
      }

    } catch (error) {
      console.error('Error fetching merchant info:', error);
      setError(error.message || 'Failed to load account setup information');
    } finally {
      setLoadingInfo(false);
    }
  };

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

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate passwords
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Submit setup data
      const response = await fetch(`${API_URL}/merchants/setup/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.password,
          description: formData.description,
          website: formData.website,
          businessHours: businessHours
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete account setup');
      }

      setShowSuccess(true);
      
      toast({
        title: "🎉 Account Setup Complete!",
        description: "Your merchant account is now ready. You can log in and start managing your business.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth?merchant=true&email=' + encodeURIComponent(merchantInfo.email));
      }, 3000);

    } catch (error) {
      console.error('Error completing setup:', error);
      setError(error.message || 'Failed to complete account setup');
      
      toast({
        title: "❌ Setup Error",
        description: error.message || 'Failed to complete account setup',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /(?=.*[a-z])/.test(password),
      /(?=.*[A-Z])/.test(password),
      /(?=.*\d)/.test(password),
      /(?=.*[!@#$%^&*])/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { level: 'weak', color: 'bg-red-500', text: 'Weak' };
    if (strength <= 3) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    if (strength <= 4) return { level: 'good', color: 'bg-blue-500', text: 'Good' };
    return { level: 'strong', color: 'bg-green-500', text: 'Strong' };
  };

  if (loadingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading account setup...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !merchantInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Setup Link Invalid</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/auth')} variant="outline">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete! 🎉</h2>
              <p className="text-gray-600 mb-4">
                Your merchant account is now ready. You'll be redirected to login shortly.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Redirecting in 3 seconds...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Account Setup
          </h1>
          <p className="text-gray-600">
            Welcome <strong>{merchantInfo?.businessName}</strong>! Let's finish setting up your merchant account.
          </p>
        </div>

        {/* Account Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-green-700">✅ Account Created Successfully</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Business Name</p>
                <p className="font-semibold">{merchantInfo?.businessName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold">{merchantInfo?.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-semibold">{merchantInfo?.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Business Type</p>
                <p className="font-semibold">{merchantInfo?.businessType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Setup */}
          <Card>
            <CardHeader>
              <CardTitle>🔒 Security Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                    placeholder="Enter a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${(passwordStrength.level === 'weak' ? 20 : passwordStrength.level === 'medium' ? 40 : passwordStrength.level === 'good' ? 60 : 80)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{passwordStrength.text}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Password must contain: lowercase, uppercase, number, and special character
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your business, services, and what makes you unique..."
                />
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
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle>⏰ Business Hours</CardTitle>
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
                          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="text-center">
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Completing Setup...
                </>
              ) : (
                '🚀 Complete Account Setup'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantAccountSetup;