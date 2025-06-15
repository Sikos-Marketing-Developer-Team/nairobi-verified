
import React, { useState } from 'react';
import { Save, Settings, Mail, MapPin, Shield, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'Nairobi Verified',
    contactEmail: 'support@nairobiverified.com',
    contactPhone: '0790120841 / 0713740807',
    verificationEmail: 'verification@nairobiverified.com',
    autoApproveThreshold: '5',
    maxDocumentSize: '10',
    requireBusinessHours: true,
    requirePhysicalAddress: true,
    allowMerchantSelfEdit: true,
    mapDefaultZoom: '15',
    categories: 'Electronics\nFashion\nHealth & Beauty\nFood & Beverage\nServices\nAutomotive'
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // In real app, this would make API call
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'map', label: 'Map Settings', icon: MapPin },
    { id: 'categories', label: 'Categories', icon: Tag }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform-wide settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <Input
                      value={settings.platformName}
                      onChange={(e) => handleInputChange('platformName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <Input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <Input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'email' && (
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Email Address
                    </label>
                    <Input
                      type="email"
                      value={settings.verificationEmail}
                      onChange={(e) => handleInputChange('verificationEmail', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email address used for sending verification notifications
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'verification' && (
              <Card>
                <CardHeader>
                  <CardTitle>Verification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-approve Threshold (days)
                    </label>
                    <Input
                      type="number"
                      value={settings.autoApproveThreshold}
                      onChange={(e) => handleInputChange('autoApproveThreshold', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Automatically approve merchants after this many days if no issues found
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Document Size (MB)
                    </label>
                    <Input
                      type="number"
                      value={settings.maxDocumentSize}
                      onChange={(e) => handleInputChange('maxDocumentSize', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Verification Requirements</h4>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.requireBusinessHours}
                        onChange={(e) => handleInputChange('requireBusinessHours', e.target.checked)}
                        className="mr-3"
                      />
                      Require business hours
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.requirePhysicalAddress}
                        onChange={(e) => handleInputChange('requirePhysicalAddress', e.target.checked)}
                        className="mr-3"
                      />
                      Require physical address verification
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.allowMerchantSelfEdit}
                        onChange={(e) => handleInputChange('allowMerchantSelfEdit', e.target.checked)}
                        className="mr-3"
                      />
                      Allow merchants to edit their own profiles
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'map' && (
              <Card>
                <CardHeader>
                  <CardTitle>Map Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Map Zoom Level
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="20"
                      value={settings.mapDefaultZoom}
                      onChange={(e) => handleInputChange('mapDefaultZoom', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Default zoom level for merchant location maps (10-20)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'categories' && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Categories (one per line)
                    </label>
                    <textarea
                      value={settings.categories}
                      onChange={(e) => handleInputChange('categories', e.target.value)}
                      rows={10}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Enter categories, one per line"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      These categories will be available for merchant registration
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="mt-6">
              <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
