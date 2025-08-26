
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Upload, Building, User, Clock, FileText, CheckCircle, X, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const MerchantRegister = () => {
  const isLoading = usePageLoading(700);
  const [currentStep, setCurrentStep] = useState(1);
  const businessRegRef = useRef<HTMLInputElement>(null);
  const idDocRef = useRef<HTMLInputElement>(null);
  const utilityBillRef = useRef<HTMLInputElement>(null);
  const additionalDocsRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState({
    businessRegistration: [],
    idDocument: [],
    utilityBill: [],
    additionalDocs: []
  });

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Business Details
    businessType: '',
    description: '',
    yearEstablished: '',
    website: '',
    
    // Step 3: Location
    address: '',
    landmark: '',
    businessHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '16:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    }
  });

  const steps = [
    { number: 1, title: 'Basic Information', icon: User },
    { number: 2, title: 'Business Details', icon: Building },
    { number: 3, title: 'Location & Hours', icon: MapPin },
    { number: 4, title: 'Verification Documents', icon: FileText }
  ];

  const businessTypes = [
    'Electronics', 'Fashion', 'Photography', 'Sports', 'Business Services',
    'Beauty & Health', 'Automotive', 'Food & Beverage', 'Books & Stationery', 'Other'
  ];

  // Calculate completion percentage
  const calculateCompletion = () => {
    const requiredDocs = [
      uploadedFiles.businessRegistration, 
      uploadedFiles.idDocument, 
      uploadedFiles.utilityBill
    ];
    const completed = requiredDocs.filter(files => files.length > 0).length;
    return Math.round((completed / 3) * 100);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.businessName.trim()) {
          toast('Business name is required!', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (!formData.email.trim()) {
          toast('Email is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (!formData.phone.trim()) {
          toast('Phone number is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (!formData.password.trim()) {
          toast('Password is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast('Passwords do not match', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        return true;
      
      case 2:
        if (!formData.businessType.trim()) {
          toast('Business type is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (!formData.description.trim()) {
          toast('Business description is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (!formData.yearEstablished.trim()) {
          toast('Year established is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        return true;
      
      case 3:
        if (!formData.address.trim()) {
          toast('Business address is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (!formData.landmark.trim()) {
          toast('Landmark is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        return true;
      
      case 4:
        if (uploadedFiles.businessRegistration.length === 0) {
          toast('At least one business registration document is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (uploadedFiles.idDocument.length === 0) {
          toast('At least one ID document is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        if (uploadedFiles.utilityBill.length === 0) {
          toast('At least one utility bill is required', { style: { background: 'crimson', color: 'white' } });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    setUploadedFiles(prev => ({
      ...prev,
      [field]: [...prev[field], ...newFiles]
    }));
    
    // Reset the file input to allow selecting the same file again
    if (field === 'businessRegistration' && businessRegRef.current) {
      businessRegRef.current.value = '';
    } else if (field === 'idDocument' && idDocRef.current) {
      idDocRef.current.value = '';
    } else if (field === 'utilityBill' && utilityBillRef.current) {
      utilityBillRef.current.value = '';
    } else if (field === 'additionalDocs' && additionalDocsRef.current) {
      additionalDocsRef.current.value = '';
    }
  };

  const removeFile = (field: string, index: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileButtonClick = (fileInputRef: React.RefObject<HTMLInputElement>) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      // Prepare form data for submission
      const submissionData = {
        ...formData,
        documents: uploadedFiles
      };
      
      console.log('Merchant registration submitted:', submissionData);
      
      // Handle form submission here - call API
      
      // Show success toast with Sonner
      toast('Registration submitted successfully!', {
        description: 'We will review your application and get back to you within 2-3 business days.',
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#16a34a',
          color: 'white',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        },
        descriptionClassName: 'text-white',
      });
      
      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageSkeleton>
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-1/2 mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    {i < 3 && <Skeleton className="h-px w-16 mx-2" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-6">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
              </div>
            </div>
          </div>
        </PageSkeleton>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 mt-5">
          <h1 className="text-3xl font-bold inter text-gray-900 mb-2">
            Register Your Business
          </h1>
          <p className="text-gray-600">
            Join Nairobi Verified and connect with customers who value trust and verification
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary' : 'text-gray-400'
                  }`}>
                    Step {step.number}
                  </p>
                  <p className={`text-sm ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Enter your business name"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0790120841 / 0713740807"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Create a strong password"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type *
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year Established
                      </label>
                      <Input
                        type="number"
                        value={formData.yearEstablished}
                        onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your business, products, and services..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
              )}

              {/* Step 3: Location & Hours */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Physical Address *
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Full business address in Nairobi CBD"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark/Building Information
                    </label>
                    <Input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Building name, floor, shop number"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Business Hours
                    </h3>
                    
                    <div className="space-y-3">
                      {Object.entries(formData.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-4">
                          <div className="w-20">
                            <span className="text-sm font-medium capitalize">{day}</span>
                          </div>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={hours.closed}
                              onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Closed</span>
                          </label>
                          
                          {!hours.closed && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                className="w-auto"
                              />
                              <span className="text-sm text-gray-500">to</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                className="w-auto"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Upload the required documents for verification. All documents should be clear and readable.
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-900">Verification Progress</span>
                      <span className="text-sm font-bold text-blue-900">{calculateCompletion()}% Complete</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${calculateCompletion()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      {calculateCompletion() < 100 
                        ? `Upload all required documents to complete your verification` 
                        : `All required documents uploaded! You can now submit your application.`}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Business Registration */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900 mb-1">Business Registration *</h4>
                      <p className="text-sm text-gray-500 mb-3">Certificate of incorporation or business permit</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileButtonClick(businessRegRef)}
                        className="mb-3"
                      >
                        <Upload className="h-4 w-4 mr-1" /> Add Files
                      </Button>
                      <input
                        type="file"
                        ref={businessRegRef}
                        onChange={(e) => handleFileChange('businessRegistration', e.target.files)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                      />
                      
                      {uploadedFiles.businessRegistration.length > 0 && (
                        <div className="mt-3 text-left">
                          <p className="text-xs font-medium text-gray-700 mb-1">Uploaded files:</p>
                          {uploadedFiles.businessRegistration.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
                              <div className="flex items-center truncate">
                                <FileText className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0"
                                onClick={() => removeFile('businessRegistration', index)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* ID Document */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900 mb-1">ID Document *</h4>
                      <p className="text-sm text-gray-500 mb-3">National ID or passport of business owner</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileButtonClick(idDocRef)}
                        className="mb-3"
                      >
                        <Upload className="h-4 w-4 mr-1" /> Add Files
                      </Button>
                      <input
                        type="file"
                        ref={idDocRef}
                        onChange={(e) => handleFileChange('idDocument', e.target.files)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                      />
                      
                      {uploadedFiles.idDocument.length > 0 && (
                        <div className="mt-3 text-left">
                          <p className="text-xs font-medium text-gray-700 mb-1">Uploaded files:</p>
                          {uploadedFiles.idDocument.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
                              <div className="flex items-center truncate">
                                <FileText className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0"
                                onClick={() => removeFile('idDocument', index)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Utility Bill */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900 mb-1">Utility Bill *</h4>
                      <p className="text-sm text-gray-500 mb-3">Recent utility bill for address verification</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileButtonClick(utilityBillRef)}
                        className="mb-3"
                      >
                        <Upload className="h-4 w-4 mr-1" /> Add Files
                      </Button>
                      <input
                        type="file"
                        ref={utilityBillRef}
                        onChange={(e) => handleFileChange('utilityBill', e.target.files)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                      />
                      
                      {uploadedFiles.utilityBill.length > 0 && (
                        <div className="mt-3 text-left">
                          <p className="text-xs font-medium text-gray-700 mb-1">Uploaded files:</p>
                          {uploadedFiles.utilityBill.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
                              <div className="flex items-center truncate">
                                <FileText className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0"
                                onClick={() => removeFile('utilityBill', index)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Additional Documents */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900 mb-1">Additional Documents</h4>
                      <p className="text-sm text-gray-500 mb-3">Any other supporting documents</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileButtonClick(additionalDocsRef)}
                        className="mb-3"
                      >
                        <Upload className="h-4 w-4 mr-1" /> Add Files
                      </Button>
                      <input
                        type="file"
                        ref={additionalDocsRef}
                        onChange={(e) => handleFileChange('additionalDocs', e.target.files)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                      />
                      
                      {uploadedFiles.additionalDocs.length > 0 && (
                        <div className="mt-3 text-left">
                          <p className="text-xs font-medium text-gray-700 mb-1">Uploaded files:</p>
                          {uploadedFiles.additionalDocs.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
                              <div className="flex items-center truncate">
                                <FileText className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0"
                                onClick={() => removeFile('additionalDocs', index)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Our verification team will review your documents within 2-3 business days</li>
                      <li>• You'll receive an email notification once the review is complete</li>
                      <li>• If approved, your business will receive a verification badge</li>
                      <li>• If additional information is needed, we'll contact you directly</li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                      I agree to the <a href="#" className="text-primary hover:text-primary-dark">Terms of Service</a> and <a href="#" className="text-primary hover:text-primary-dark">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark"
                    disabled={calculateCompletion() < 100}
                  >
                    Submit for Verification
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default MerchantRegister;