"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Save, 
  Upload,
  Mail,
  CreditCard,
  Shield,
  Globe,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    logoUrl: string;
    faviconUrl: string;
    maintenanceMode: boolean;
  };
  email: {
    fromEmail: string;
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
  };
  payment: {
    currency: string;
    currencySymbol: string;
    stripePublicKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    paypalSecret: string;
    testMode: boolean;
  };
  security: {
    enableTwoFactor: boolean;
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUppercase: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    googleAnalyticsId: string;
    enableSitemap: boolean;
    enableRobotsTxt: boolean;
  };
  legal: {
    termsOfService: string;
    privacyPolicy: string;
    refundPolicy: string;
    cookiePolicy: string;
  };
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  
  // State for settings
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State for file uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  
  // State for saving
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Fetch settings
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/settings`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      
      const data = await response.json();
      setSettings(data.settings);
      
      // Set image previews
      if (data.settings.general.logoUrl) {
        setLogoPreview(data.settings.general.logoUrl);
      }
      
      if (data.settings.general.faviconUrl) {
        setFaviconPreview(data.settings.general.faviconUrl);
      }
      
      if (data.settings.seo.ogImage) {
        setOgImagePreview(data.settings.seo.ogImage);
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err.message || "Failed to load settings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = async (section: string) => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Handle file uploads first
      let logoUrl = settings.general.logoUrl;
      let faviconUrl = settings.general.faviconUrl;
      let ogImage = settings.seo.ogImage;
      
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('image', logoFile);
        logoFormData.append('type', 'logo');
        
        const logoResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/upload`, {
          method: 'POST',
          body: logoFormData,
          credentials: 'include'
        });
        
        if (!logoResponse.ok) {
          throw new Error("Failed to upload logo");
        }
        
        const logoData = await logoResponse.json();
        logoUrl = logoData.imageUrl;
      }
      
      if (faviconFile) {
        const faviconFormData = new FormData();
        faviconFormData.append('image', faviconFile);
        faviconFormData.append('type', 'favicon');
        
        const faviconResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/upload`, {
          method: 'POST',
          body: faviconFormData,
          credentials: 'include'
        });
        
        if (!faviconResponse.ok) {
          throw new Error("Failed to upload favicon");
        }
        
        const faviconData = await faviconResponse.json();
        faviconUrl = faviconData.imageUrl;
      }
      
      if (ogImageFile) {
        const ogImageFormData = new FormData();
        ogImageFormData.append('image', ogImageFile);
        ogImageFormData.append('type', 'og-image');
        
        const ogImageResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/upload`, {
          method: 'POST',
          body: ogImageFormData,
          credentials: 'include'
        });
        
        if (!ogImageResponse.ok) {
          throw new Error("Failed to upload OG image");
        }
        
        const ogImageData = await ogImageResponse.json();
        ogImage = ogImageData.imageUrl;
      }
      
      // Update settings with new image URLs
      const updatedSettings = {
        ...settings,
        general: {
          ...settings.general,
          logoUrl,
          faviconUrl
        },
        seo: {
          ...settings.seo,
          ogImage
        }
      };
      
      // Save settings
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings[section as keyof SiteSettings]),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save ${section} settings`);
      }
      
      setSettings(updatedSettings);
      setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
      
      // Clear file states
      if (section === 'general') {
        setLogoFile(null);
        setFaviconFile(null);
      }
      
      if (section === 'seo') {
        setOgImageFile(null);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      toast({
        title: "Settings saved",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been updated successfully.`
      });
    } catch (err: any) {
      console.error(`Error saving ${section} settings:`, err);
      setError(err.message || `Failed to save ${section} settings. Please try again later.`);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || `Failed to save ${section} settings.`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleInputChange = (section: keyof SiteSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'og-image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(reader.result as string);
      } else if (type === 'favicon') {
        setFaviconFile(file);
        setFaviconPreview(reader.result as string);
      } else if (type === 'og-image') {
        setOgImageFile(file);
        setOgImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error && !settings) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!settings) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">Failed to load settings. Please try again later.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Site Settings</h1>
        </div>
        
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic information about your marketplace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      placeholder="My Marketplace"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                    placeholder="A brief description of your marketplace"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      value={settings.general.supportPhone}
                      onChange={(e) => handleInputChange('general', 'supportPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceMode"
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) => handleInputChange('general', 'maintenanceMode', checked)}
                      />
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Site Logo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {logoPreview ? (
                        <div className="relative">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="max-h-24 mx-auto"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setLogoPreview(null);
                              setLogoFile(null);
                              handleInputChange('general', 'logoUrl', '');
                            }}
                          >
                            Remove Logo
                          </Button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-2">
                            Upload your site logo
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('logoUpload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </Button>
                        </div>
                      )}
                      <input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'logo')}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Recommended size: 200 x 50 pixels. Max file size: 1MB.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {faviconPreview ? (
                        <div className="relative">
                          <img 
                            src={faviconPreview} 
                            alt="Favicon preview" 
                            className="max-h-16 mx-auto"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setFaviconPreview(null);
                              setFaviconFile(null);
                              handleInputChange('general', 'faviconUrl', '');
                            }}
                          >
                            Remove Favicon
                          </Button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 mb-2">
                            Upload your site favicon
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('faviconUpload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Favicon
                          </Button>
                        </div>
                      )}
                      <input
                        id="faviconUpload"
                        type="file"
                        accept="image/x-icon,image/png"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'favicon')}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Recommended size: 32 x 32 pixels. Use .ico or .png format.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('general')}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save General Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure your email service for notifications and user communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                      placeholder="noreply@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                      placeholder="smtp.example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleInputChange('email', 'smtpPort', e.target.value)}
                      placeholder="587"
                    />
                  </div>
                  
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smtpSecure"
                        checked={settings.email.smtpSecure}
                        onCheckedChange={(checked) => handleInputChange('email', 'smtpSecure', checked)}
                      />
                      <Label htmlFor="smtpSecure">Use Secure Connection (TLS/SSL)</Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                      placeholder="username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('email')}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Email Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure payment gateways and currency settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={settings.payment.currency}
                      onChange={(e) => handleInputChange('payment', 'currency', e.target.value)}
                      placeholder="USD"
                    />
                    <p className="text-xs text-gray-500">
                      Three-letter ISO currency code (e.g., USD, EUR, GBP)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Currency Symbol</Label>
                    <Input
                      id="currencySymbol"
                      value={settings.payment.currencySymbol}
                      onChange={(e) => handleInputChange('payment', 'currencySymbol', e.target.value)}
                      placeholder="$"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Stripe Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                      <Input
                        id="stripePublicKey"
                        value={settings.payment.stripePublicKey}
                        onChange={(e) => handleInputChange('payment', 'stripePublicKey', e.target.value)}
                        placeholder="pk_test_..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={settings.payment.stripeSecretKey}
                        onChange={(e) => handleInputChange('payment', 'stripeSecretKey', e.target.value)}
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">PayPal Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                      <Input
                        id="paypalClientId"
                        value={settings.payment.paypalClientId}
                        onChange={(e) => handleInputChange('payment', 'paypalClientId', e.target.value)}
                        placeholder="Client ID"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paypalSecret">PayPal Secret</Label>
                      <Input
                        id="paypalSecret"
                        type="password"
                        value={settings.payment.paypalSecret}
                        onChange={(e) => handleInputChange('payment', 'paypalSecret', e.target.value)}
                        placeholder="Secret"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="testMode"
                      checked={settings.payment.testMode}
                      onCheckedChange={(checked) => handleInputChange('payment', 'testMode', checked)}
                    />
                    <Label htmlFor="testMode">Test Mode</Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    When enabled, payments will be processed in test/sandbox mode.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('payment')}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Payment Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security options for your marketplace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableTwoFactor"
                      checked={settings.security.enableTwoFactor}
                      onCheckedChange={(checked) => handleInputChange('security', 'enableTwoFactor', checked)}
                    />
                    <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    When enabled, users can set up two-factor authentication for their accounts.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Password Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        min="6"
                        max="32"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        min="3"
                        max="10"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="passwordRequireSpecial"
                        checked={settings.security.passwordRequireSpecial}
                        onCheckedChange={(checked) => handleInputChange('security', 'passwordRequireSpecial', checked)}
                      />
                      <Label htmlFor="passwordRequireSpecial">Require Special Characters</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="passwordRequireNumbers"
                        checked={settings.security.passwordRequireNumbers}
                        onCheckedChange={(checked) => handleInputChange('security', 'passwordRequireNumbers', checked)}
                      />
                      <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="passwordRequireUppercase"
                        checked={settings.security.passwordRequireUppercase}
                        onCheckedChange={(checked) => handleInputChange('security', 'passwordRequireUppercase', checked)}
                      />
                      <Label htmlFor="passwordRequireUppercase">Require Uppercase</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="15"
                    max="1440"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Time in minutes before an inactive user is automatically logged out.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('security')}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Security Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* SEO Settings */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Configure search engine optimization settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Default Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={settings.seo.metaTitle}
                      onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                      placeholder="My Marketplace - Buy and Sell Verified Products"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Default Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={settings.seo.metaDescription}
                      onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                      placeholder="A marketplace for verified products and trusted merchants..."
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      Recommended length: 150-160 characters
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Open Graph Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {ogImagePreview ? (
                      <div className="relative">
                        <img 
                          src={ogImagePreview} 
                          alt="OG Image preview" 
                          className="max-h-48 mx-auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setOgImagePreview(null);
                            setOgImageFile(null);
                            handleInputChange('seo', 'ogImage', '');
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          Upload an image for social media sharing
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('ogImageUpload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    )}
                    <input
                      id="ogImageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'og-image')}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Recommended size: 1200 x 630 pixels. This image will be used when your site is shared on social media.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) => handleInputChange('seo', 'googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableSitemap"
                      checked={settings.seo.enableSitemap}
                      onCheckedChange={(checked) => handleInputChange('seo', 'enableSitemap', checked)}
                    />
                    <Label htmlFor="enableSitemap">Generate XML Sitemap</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableRobotsTxt"
                      checked={settings.seo.enableRobotsTxt}
                      onCheckedChange={(checked) => handleInputChange('seo', 'enableRobotsTxt', checked)}
                    />
                    <Label htmlFor="enableRobotsTxt">Generate robots.txt</Label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('seo')}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save SEO Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Legal Settings */}
          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle>Legal Documents</CardTitle>
                <CardDescription>
                  Manage your legal documents and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="termsOfService">Terms of Service</Label>
                  <Textarea
                    id="termsOfService"
                    value={settings.legal.termsOfService}
                    onChange={(e) => handleInputChange('legal', 'termsOfService', e.target.value)}
                    placeholder="Enter your terms of service here..."
                    rows={10}
                  />
                  <p className="text-xs text-gray-500">
                    HTML is supported. You can use basic formatting tags.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="privacyPolicy">Privacy Policy</Label>
                  <Textarea
                    id="privacyPolicy"
                    value={settings.legal.privacyPolicy}
                    onChange={(e) => handleInputChange('legal', 'privacyPolicy', e.target.value)}
                    placeholder="Enter your privacy policy here..."
                    rows={10}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refundPolicy">Refund Policy</Label>
                  <Textarea
                    id="refundPolicy"
                    value={settings.legal.refundPolicy}
                    onChange={(e) => handleInputChange('legal', 'refundPolicy', e.target.value)}
                    placeholder="Enter your refund policy here..."
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cookiePolicy">Cookie Policy</Label>
                  <Textarea
                    id="cookiePolicy"
                    value={settings.legal.cookiePolicy}
                    onChange={(e) => handleInputChange('legal', 'cookiePolicy', e.target.value)}
                    placeholder="Enter your cookie policy here..."
                    rows={6}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveSettings('legal')}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Legal Documents
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}