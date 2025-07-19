import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type CookiePreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
};

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    functional: true,
    analytics: true,
    advertising: false,
  });

  useEffect(() => {
    // Check if user has already set cookie preferences
    const consentGiven = localStorage.getItem('cookieConsentGiven');
    if (!consentGiven) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(localStorage.getItem('cookiePreferences') || '{}');
        setPreferences({
          ...preferences,
          ...savedPreferences,
        });
      } catch (error) {
        console.error('Failed to parse saved cookie preferences:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      advertising: true,
    };
    
    setPreferences(allAccepted);
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
    setShowPreferences(false);
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      advertising: false,
    };
    
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
    setShowBanner(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsentGiven', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    
    // In a real app, you would set cookies based on preferences
    // For example, you might disable Google Analytics if analytics is false
    if (prefs.analytics) {
      // Enable analytics cookies
      console.log('Analytics cookies enabled');
    } else {
      // Disable analytics cookies
      console.log('Analytics cookies disabled');
    }
    
    if (prefs.advertising) {
      // Enable advertising cookies
      console.log('Advertising cookies enabled');
    } else {
      // Disable advertising cookies
      console.log('Advertising cookies disabled');
    }
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot change necessary cookies
    
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const openPreferences = () => {
    setShowPreferences(true);
  };

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0">
                <Cookie className="h-8 w-8 text-primary" />
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-semibold mb-2">We value your privacy</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                  <Link to="/cookie-policy" className="text-primary hover:underline ml-1">
                    Read our Cookie Policy
                  </Link>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRejectNonEssential}
                  className="whitespace-nowrap"
                >
                  Essential Only
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openPreferences}
                  className="whitespace-nowrap"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAcceptAll}
                  className="whitespace-nowrap bg-primary hover:bg-primary-dark"
                >
                  Accept All
                </Button>
              </div>
              
              <button 
                onClick={() => setShowBanner(false)} 
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="Close cookie banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Customize your cookie preferences. Some cookies are necessary for the website to function properly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox 
                id="necessary" 
                checked={preferences.necessary} 
                disabled={true}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="necessary" className="font-medium">
                  Necessary Cookies
                </Label>
                <p className="text-sm text-gray-500">
                  These cookies are essential for the website to function properly and cannot be disabled.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox 
                id="functional" 
                checked={preferences.functional} 
                onCheckedChange={() => handlePreferenceChange('functional')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="functional" className="font-medium">
                  Functional Cookies
                </Label>
                <p className="text-sm text-gray-500">
                  These cookies enable personalized features and functionality.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox 
                id="analytics" 
                checked={preferences.analytics} 
                onCheckedChange={() => handlePreferenceChange('analytics')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="analytics" className="font-medium">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-gray-500">
                  These cookies help us understand how visitors interact with our website.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox 
                id="advertising" 
                checked={preferences.advertising} 
                onCheckedChange={() => handlePreferenceChange('advertising')}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="advertising" className="font-medium">
                  Advertising Cookies
                </Label>
                <p className="text-sm text-gray-500">
                  These cookies are used to show you relevant advertisements on and off our website.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleRejectNonEssential}
            >
              Essential Only
            </Button>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                variant="outline"
                onClick={() => setShowPreferences(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAcceptSelected}>
                Save Preferences
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cookie Settings Button (fixed at bottom right) */}
      {!showBanner && (
        <button
          onClick={openPreferences}
          className="fixed bottom-4 right-4 bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 z-40"
          aria-label="Cookie Settings"
        >
          <Cookie className="h-5 w-5 text-primary" />
        </button>
      )}
    </>
  );
};

export default CookieConsent;