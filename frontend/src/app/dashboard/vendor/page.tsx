"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMapPin, FiPhone, FiMail, FiGlobe, FiUpload, FiDollarSign, FiPackage, FiStar, FiTruck } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function VendorDashboard() {
  const router = useRouter();
  interface User {
    companyName?: string;
    location?: string;
    phone?: string;
    email?: string;
    isEmailVerified: boolean;
  }

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState('basic');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user");
        }
        if (!data.user.isEmailVerified) {
          router.push('/auth/verify-email');
          return;
        }
        setUser(data.user);
      } catch (err) {
        setError("Failed to load user data. Please sign in again.");
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setUploadedFiles(files);
      try {
        const formData = new FormData();
        files.forEach((file, index) => {
          const field = index === 0 ? 'businessRegistration' : index === 1 ? 'taxCertificate' : 'idDocument';
          formData.append(field, file);
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/upload-documents`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Upload failed");
        }
        alert('Documents uploaded successfully');
      } catch (err) {
        setError('Failed to upload documents');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!user) {
    return null;
  }

  const storeDetails = {
    name: user.companyName || 'Electronics Hub',
    location: user.location || 'Westlands, Nairobi',
    phone: user.phone || '+254 712 345 678',
    email: user.email || 'contact@electronicshub.com',
    website: 'www.electronicshub.com',
    social: {
      facebook: 'electronicsHub',
      twitter: '@electronicsHub',
      instagram: '@electronics_hub'
    },
    rating: 4.5,
    reviews: 128,
    subscription: 'basic'
  };

  const subscriptionPlans = [
    {
      name: 'Basic',
      price: 'Free',
      features: [
        'Basic store listing',
        'Product uploads (up to 10)',
        'Customer reviews',
        'Store location on map'
      ]
    },
    {
      name: 'Premium',
      price: '$29.99/month',
      features: [
        'Advanced store listing',
        'Unlimited product uploads',
        'Transaction tracking',
        'Parcel tracking',
        'Priority support',
        'Analytics dashboard',
        'Featured in search results'
      ]
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Vendor Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="dashboard-card">
          <h2 className="text-xl font-semibold mb-6">Store Details</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FiMapPin className="text-orange-500" />
              <span>{storeDetails.location}</span>
            </div>
            <div className="flex items-center space-x-3">
              <FiPhone className="text-orange-500" />
              <span>{storeDetails.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <FiMail className="text-orange-500" />
              <span>{storeDetails.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <FiGlobe className="text-orange-500" />
              <span>{storeDetails.website}</span>
            </div>
            <div className="flex items-center space-x-6 mt-4">
              <a href="#" className="text-blue-600 hover:text-blue-800">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-600">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-pink-600 hover:text-pink-800">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="dashboard-card">
          <h2 className="text-xl font-semibold mb-6">Business Verification</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Upload Business Permit</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                id="permit-upload"
              />
              <label
                htmlFor="permit-upload"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 cursor-pointer"
              >
                Select File
              </label>
            </div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Upload Store Photos</p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                id="photos-upload"
              />
              <label
                htmlFor="photos-upload"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 cursor-pointer"
              >
                Select Photos
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name.toLowerCase()}
              className={`border rounded-lg p-6 ${
                selectedSubscription === plan.name.toLowerCase()
                  ? 'border-orange-500 bg-orange-50 dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <span className="text-2xl font-bold text-orange-500">{plan.price}</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <FiDollarSign className="mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full py-2 rounded-lg ${
                  selectedSubscription === plan.name.toLowerCase()
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setSelectedSubscription(plan.name.toLowerCase())}
              >
                {selectedSubscription === plan.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
      {selectedSubscription === 'premium' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Transaction Tracking</h2>
              <FiPackage className="text-orange-500 w-6 h-6" />
            </div>
            <div className="space-y-4">{/* Add transaction tracking content */}</div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Parcel Tracking</h2>
              <FiTruck className="text-orange-500 w-6 h-6" />
            </div>
            <div className="space-y-4">{/* Add parcel tracking content */}</div>
          </div>
        </div>
      )}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Customer Reviews</h2>
          <div className="flex items-center">
            <FiStar className="text-yellow-400 w-6 h-6" />
            <span className="ml-2 font-semibold">{storeDetails.rating}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">({storeDetails.reviews} reviews)</span>
          </div>
        </div>
        <div className="space-y-4">{/* Add reviews content */}</div>
      </div>
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Google My Business</h2>
          <FiGlobe className="text-orange-500 w-6 h-6" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Connect your store with Google My Business to improve visibility and manage your online presence.
        </p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
          Connect with Google My Business
        </button>
      </div>
    </div>
  );
}