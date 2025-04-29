"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import Image from "next/image";
import { FaCamera, FaUpload, FaSave, FaExclamationTriangle } from "react-icons/fa";

export default function VendorProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [tabErrors, setTabErrors] = useState<{[key: string]: string}>({});
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    // Basic Information
    businessName: "",
    businessDescription: "",
    businessLogo: null as File | null,
    businessLogoPreview: "",
    
    // Contact Information
    email: "",
    phone: "",
    alternativePhone: "",
    website: "",
    
    // Location Information
    physicalAddress: "",
    city: "",
    county: "",
    postalCode: "",
    googleMapsLink: "",
    
    // Business Documents
    kraPin: "",
    kraCertificate: null as File | null,
    kraCertificatePreview: "",
    businessPermit: null as File | null,
    businessPermitPreview: "",
    
    // Business Details
    businessType: "",
    yearEstablished: "",
    numberOfEmployees: "",
    operatingHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "10:00", close: "15:00", closed: false },
      sunday: { open: "10:00", close: "15:00", closed: true },
    },
    
    // Payment Information
    paymentMethods: {
      mpesa: true,
      bankTransfer: false,
      cash: true,
      creditCard: false,
    },
    mpesaNumber: "",
    bankName: "",
    accountNumber: "",
    
    // Social Media
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      tiktok: "",
    },
  });
  
  // Business types
  const businessTypes = [
    "Retail Store",
    "Restaurant",
    "Electronics",
    "Fashion",
    "Grocery",
    "Beauty & Health",
    "Home & Garden",
    "Other"
  ];
  
  // Counties in Kenya
  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", 
    "Uasin Gishu", "Meru", "Machakos", "Kakamega", "Nyeri",
    "Kilifi", "Kisii", "Turkana", "Bungoma", "Kajiado",
    "Garissa", "Kitui", "Kwale", "Laikipia", "Makueni",
    "Murang'a", "Nandi", "Narok", "Nyamira", "Siaya",
    "Taita Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia", "Vihiga",
    "Wajir", "West Pokot", "Baringo", "Bomet", "Busia",
    "Elgeyo Marakwet", "Embu", "Homa Bay", "Isiolo", "Kericho",
    "Kirinyaga", "Lamu", "Mandera", "Marsabit", "Migori",
    "Samburu"
  ];
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, previewField: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target) {
          setProfileData(prev => ({
            ...prev,
            [field]: file,
            [previewField]: event.target?.result as string
          }));
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle operating hours changes
  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }));
  };
  
  // Handle payment method changes
  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: checked
      }
    }));
  };
  
  // Handle social media changes
  const handleSocialMediaChange = (platform: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };
  
  // Validate tab before changing
  const validateTab = (nextTab: string): boolean => {
    // Clear previous errors
    setTabErrors({});
    
    // Define required fields for each tab
    const tabValidation: {[key: string]: string[]} = {
      basic: ['businessName', 'businessDescription', 'businessLogo'],
      contact: ['email', 'phone', 'physicalAddress', 'city', 'county', 'postalCode'],
      documents: ['kraPin', 'kraCertificate', 'businessPermit'],
      details: ['businessType', 'yearEstablished', 'numberOfEmployees'],
      payment: ['mpesaNumber']
    };
    
    // Check if required fields for current tab are filled
    const requiredFields = tabValidation[activeTab];
    const errors: {[key: string]: string} = {};
    
    for (const field of requiredFields) {
      if (field.includes('Logo') || field.includes('Certificate') || field.includes('Permit')) {
        // Check file fields
        if (!profileData[field as keyof typeof profileData]) {
          errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
        }
      } else {
        // Check text fields
        const value = profileData[field as keyof typeof profileData];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
        }
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setTabErrors(errors);
      return false;
    }
    
    return true;
  };
  
  // Handle tab change with validation
  const handleTabChange = (nextTab: string) => {
    if (validateTab(nextTab)) {
      setActiveTab(nextTab);
    } else {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    // Validate all fields before submission
    const completionStatus = checkProfileCompletion();
    if (!completionStatus.isComplete) {
      setError("Please fill in all required fields before submitting.");
      setIsLoading(false);
      return;
    }
    
    try {
      // Create FormData object to handle file uploads
      const formData = new FormData();
      
      // Append all text fields
      Object.entries(profileData).forEach(([key, value]) => {
        if (key !== 'businessLogo' && key !== 'kraCertificate' && key !== 'businessPermit' && 
            key !== 'businessLogoPreview' && key !== 'kraCertificatePreview' && key !== 'businessPermitPreview' &&
            key !== 'operatingHours' && key !== 'paymentMethods' && key !== 'socialMedia') {
          formData.append(key, value as string);
        }
      });
      
      // Append complex objects as JSON strings
      formData.append('operatingHours', JSON.stringify(profileData.operatingHours));
      formData.append('paymentMethods', JSON.stringify(profileData.paymentMethods));
      formData.append('socialMedia', JSON.stringify(profileData.socialMedia));
      
      // Append files if they exist
      if (profileData.businessLogo) {
        formData.append('businessLogo', profileData.businessLogo);
      }
      
      if (profileData.kraCertificate) {
        formData.append('kraCertificate', profileData.kraCertificate);
      }
      
      if (profileData.businessPermit) {
        formData.append('businessPermit', profileData.businessPermit);
      }
      
      // For development/demo purposes - skip actual API call
      // In production, uncomment the actual API call
      /*
      // Send data to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vendor/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      */
      
      // Demo mode - simulate successful profile update
      setSuccess('Profile submitted successfully!');
      setProfileComplete(true);
      
      // Redirect to confirmation page after 2 seconds
      setTimeout(() => {
        router.push(`/vendor/confirmation?businessName=${encodeURIComponent(profileData.businessName)}`);
      }, 2000);
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch') {
          setError("Cannot connect to server. Please try again later.");
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check profile completion status
  const checkProfileCompletion = () => {
    const requiredFields = [
      // Basic Information
      'businessName',
      'businessDescription',
      
      // Contact Information
      'email',
      'phone',
      'website',
      
      // Location Information
      'physicalAddress',
      'city',
      'county',
      'postalCode',
      'googleMapsLink',
      
      // Business Documents
      'kraPin',
      
      // Business Details
      'businessType',
      'yearEstablished',
      'numberOfEmployees',
      
      // Payment Information
      'mpesaNumber',
    ];
    
    const requiredFiles = [
      'businessLogo',
      'kraCertificate',
      'businessPermit'
    ];
    
    const missingFields = requiredFields.filter(field => !profileData[field as keyof typeof profileData]);
    const missingFiles = requiredFiles.filter(field => !profileData[field as keyof typeof profileData]);
    
    return {
      isComplete: missingFields.length === 0 && missingFiles.length === 0,
      missingFields,
      missingFiles
    };
  };
  
  // Load profile data if it exists
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/signin');
          return;
        }
        
        // For development/demo purposes - skip actual API call
        // In production, uncomment the actual API call
        /*
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vendor/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update state with fetched data
          setProfileData(prev => ({
            ...prev,
            ...data,
            businessLogoPreview: data.businessLogoUrl || '',
            kraCertificatePreview: data.kraCertificateUrl || '',
            businessPermitPreview: data.businessPermitUrl || ''
          }));
          
          // Check if profile is complete
          setProfileComplete(checkProfileCompletion().isComplete);
        }
        */
        
        // Demo mode - use default empty profile
        // This allows the form to be filled out without backend connection
        setProfileData(prev => ({
          ...prev,
          // You can pre-fill some fields for demo purposes if needed
          businessName: token.includes('merchant') ? "Demo Merchant" : "",
          email: "demo@example.com",
          phone: "+254700000000",
        }));
        
        setProfileComplete(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [router]);
  
  const completionStatus = checkProfileCompletion();
  
  return (
    <MainLayout>
      <div className="bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-6xl mx-auto">
            <div className="p-6 bg-orange-600 text-white">
              <h1 className="text-2xl font-bold">Complete Your Vendor Profile</h1>
              <p className="mt-2">
                Please provide the following information to complete your vendor profile. 
                This will help customers find and trust your business.
              </p>
            </div>
            
            {/* Profile Completion Status */}
            {!profileComplete && (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your profile is incomplete. Please fill in all required fields marked with an asterisk (*).
                    </p>
                    {completionStatus.missingFields.length > 0 && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Missing information: {completionStatus.missingFields.join(', ')}
                      </p>
                    )}
                    {completionStatus.missingFiles.length > 0 && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Missing files: {completionStatus.missingFiles.map(f => f.replace(/([A-Z])/g, ' $1').trim()).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                <button
                  onClick={() => handleTabChange('basic')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'basic'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => handleTabChange('contact')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'contact'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contact & Location
                </button>
                <button
                  onClick={() => handleTabChange('documents')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Business Documents
                </button>
                <button
                  onClick={() => handleTabChange('details')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Business Details
                </button>
                <button
                  onClick={() => handleTabChange('payment')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'payment'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Payment & Social
                </button>
              </nav>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`col-span-2 ${tabErrors.businessLogo ? 'error-field' : ''}`}>
                      <div className="flex justify-center">
                        <div className={`relative w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-2 ${
                          tabErrors.businessLogo ? 'border-red-300' : 'border-gray-300'
                        }`}>
                          {profileData.businessLogoPreview ? (
                            <Image 
                              src={profileData.businessLogoPreview} 
                              alt="Business Logo" 
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <FaCamera size={40} />
                            </div>
                          )}
                          <label className="absolute inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                            <FaUpload className="text-white" size={24} />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'businessLogo', 'businessLogoPreview')}
                              required
                            />
                            <span className="text-white text-sm ml-2">Upload Logo *</span>
                          </label>
                        </div>
                      </div>
                      <p className={`text-center text-sm mt-2 ${
                        tabErrors.businessLogo ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {tabErrors.businessLogo || 'Upload your business logo (Recommended size: 400x400px)'}
                      </p>
                    </div>
                    
                    <div className={tabErrors.businessName ? 'error-field' : ''}>
                      <label className="block text-sm font-medium text-gray-700">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={profileData.businessName}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 ${
                          tabErrors.businessName 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-orange-500'
                        }`}
                        required
                      />
                      {tabErrors.businessName && (
                        <p className="mt-1 text-sm text-red-600">{tabErrors.businessName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Business Type *
                      </label>
                      <select
                        name="businessType"
                        value={profileData.businessType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="">Select Business Type</option>
                        {businessTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Business Description
                      </label>
                      <textarea
                        name="businessDescription"
                        value={profileData.businessDescription}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Describe your business, products, and services..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Year Established
                      </label>
                      <input
                        type="number"
                        name="yearEstablished"
                        value={profileData.yearEstablished}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Number of Employees
                      </label>
                      <select
                        name="numberOfEmployees"
                        value={profileData.numberOfEmployees}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select</option>
                        <option value="1-5">1-5</option>
                        <option value="6-10">6-10</option>
                        <option value="11-20">11-20</option>
                        <option value="21-50">21-50</option>
                        <option value="51-100">51-100</option>
                        <option value="100+">100+</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Contact & Location */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Alternative Phone Number
                      </label>
                      <input
                        type="tel"
                        name="alternativePhone"
                        value={profileData.alternativePhone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-800 pt-4">Location Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Physical Address *
                      </label>
                      <input
                        type="text"
                        name="physicalAddress"
                        value={profileData.physicalAddress}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        City/Town *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        County *
                      </label>
                      <select
                        name="county"
                        value={profileData.county}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="">Select County</option>
                        {counties.map((county) => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={profileData.postalCode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Google Maps Link
                      </label>
                      <input
                        type="url"
                        name="googleMapsLink"
                        value={profileData.googleMapsLink}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="https://goo.gl/maps/..."
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Business Documents */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Business Documents</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        KRA PIN *
                      </label>
                      <input
                        type="text"
                        name="kraPin"
                        value={profileData.kraPin}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KRA Certificate *
                      </label>
                      <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-md p-6 relative">
                        {profileData.kraCertificatePreview ? (
                          <div className="relative w-full h-48">
                            <Image 
                              src={profileData.kraCertificatePreview} 
                              alt="KRA Certificate" 
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                <span>Upload KRA Certificate</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleFileChange(e, 'kraCertificate', 'kraCertificatePreview')}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF up to 10MB
                            </p>
                          </div>
                        )}
                        
                        {profileData.kraCertificatePreview && (
                          <button
                            type="button"
                            onClick={() => handleFileChange({ target: { files: null } } as any, 'kraCertificate', 'kraCertificatePreview')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <span className="sr-only">Remove</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Permit (Optional)
                      </label>
                      <div className="flex items-center justify-center border-2 border-gray-300 border-dashed rounded-md p-6 relative">
                        {profileData.businessPermitPreview ? (
                          <div className="relative w-full h-48">
                            <Image 
                              src={profileData.businessPermitPreview} 
                              alt="Business Permit" 
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                <span>Upload Business Permit</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleFileChange(e, 'businessPermit', 'businessPermitPreview')}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF up to 10MB
                            </p>
                          </div>
                        )}
                        
                        {profileData.businessPermitPreview && (
                          <button
                            type="button"
                            onClick={() => handleFileChange({ target: { files: null } } as any, 'businessPermit', 'businessPermitPreview')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <span className="sr-only">Remove</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Business Details */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Operating Hours</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Day
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Open
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Close
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Closed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(profileData.operatingHours).map(([day, hours]) => (
                          <tr key={day}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                              {day}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                disabled={hours.closed}
                                className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                disabled={hours.closed}
                                className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="checkbox"
                                checked={hours.closed}
                                onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                              />
                              <span className="ml-2">Closed</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Payment & Social */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Payment Methods</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="mpesa"
                        type="checkbox"
                        checked={profileData.paymentMethods.mpesa}
                        onChange={(e) => handlePaymentMethodChange('mpesa', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="mpesa" className="ml-2 block text-sm text-gray-900">
                        M-Pesa
                      </label>
                    </div>
                    
                    {profileData.paymentMethods.mpesa && (
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-gray-700">
                          M-Pesa Number
                        </label>
                        <input
                          type="text"
                          name="mpesaNumber"
                          value={profileData.mpesaNumber}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <input
                        id="bankTransfer"
                        type="checkbox"
                        checked={profileData.paymentMethods.bankTransfer}
                        onChange={(e) => handlePaymentMethodChange('bankTransfer', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="bankTransfer" className="ml-2 block text-sm text-gray-900">
                        Bank Transfer
                      </label>
                    </div>
                    
                    {profileData.paymentMethods.bankTransfer && (
                      <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            name="bankName"
                            value={profileData.bankName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Account Number
                          </label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={profileData.accountNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <input
                        id="cash"
                        type="checkbox"
                        checked={profileData.paymentMethods.cash}
                        onChange={(e) => handlePaymentMethodChange('cash', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="cash" className="ml-2 block text-sm text-gray-900">
                        Cash on Delivery
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="creditCard"
                        type="checkbox"
                        checked={profileData.paymentMethods.creditCard}
                        onChange={(e) => handlePaymentMethodChange('creditCard', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="creditCard" className="ml-2 block text-sm text-gray-900">
                        Credit/Debit Card
                      </label>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-800 pt-4">Social Media</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Facebook
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          facebook.com/
                        </span>
                        <input
                          type="text"
                          value={profileData.socialMedia.facebook}
                          onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                          placeholder="yourbusiness"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Instagram
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          value={profileData.socialMedia.instagram}
                          onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                          placeholder="yourbusiness"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Twitter
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          value={profileData.socialMedia.twitter}
                          onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                          placeholder="yourbusiness"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        TikTok
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          value={profileData.socialMedia.tiktok}
                          onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-orange-500 focus:border-orange-500 border-gray-300"
                          placeholder="yourbusiness"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Form Actions */}
              <div className="pt-6 border-t border-gray-200 mt-6 flex justify-between items-center">
                <div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  {success && (
                    <p className="text-sm text-green-600">{success}</p>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['basic', 'contact', 'documents', 'details', 'payment'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    disabled={activeTab === 'basic'}
                  >
                    Previous
                  </button>
                  
                  {activeTab !== 'payment' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'contact', 'documents', 'details', 'payment'];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1]);
                        }
                      }}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Save Profile
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}