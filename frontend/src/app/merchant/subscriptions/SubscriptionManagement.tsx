'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CalendarIcon, CheckCircle, Clock, RefreshCw, ShoppingBag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import SubscriptionPackagesList from '@/components/subscription/SubscriptionPackagesList';
import SubscriptionCheckout from '@/components/subscription/SubscriptionCheckout';

interface CurrentSubscription {
  _id: string;
  package: {
    _id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    durationUnit: string;
    productLimit: number;
    featuredProductsLimit: number;
  };
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  autoRenew: boolean;
}

enum SubscriptionView {
  CURRENT = 'current',
  PACKAGES = 'packages',
  CHECKOUT = 'checkout',
}

const SubscriptionManagement: React.FC = () => {
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<SubscriptionView>(SubscriptionView.CURRENT);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  
  // Fetch current subscription
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/current`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            // No active subscription found, show packages
            setCurrentSubscription(null);
            setView(SubscriptionView.PACKAGES);
            return;
          }
          throw new Error('Failed to fetch current subscription');
        }
        
        const data = await response.json();
        setCurrentSubscription(data.subscription);
        setError(null);
      } catch (err) {
        console.error('Error fetching current subscription:', err);
        setError('Failed to load subscription details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSubscription();
  }, []);

  // Calculate days remaining and progress
  const calculateDaysRemaining = () => {
    if (!currentSubscription) return { daysRemaining: 0, progress: 0 };
    
    const now = new Date();
    const endDate = new Date(currentSubscription.endDate);
    const startDate = new Date(currentSubscription.startDate);
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    return { daysRemaining, progress };
  };

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
    setView(SubscriptionView.CHECKOUT);
  };

  const handleBackToPackages = () => {
    setView(SubscriptionView.PACKAGES);
  };

  const handleRenewSubscription = () => {
    if (currentSubscription) {
      setSelectedPackageId(currentSubscription.package._id);
      setView(SubscriptionView.CHECKOUT);
    }
  };

  const handleBrowsePackages = () => {
    setView(SubscriptionView.PACKAGES);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (view === SubscriptionView.PACKAGES) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Choose a Subscription Package</h2>
        <p className="text-muted-foreground mb-6">
          Select a subscription package that best fits your business needs
        </p>
        
        <SubscriptionPackagesList 
          onSelectPackage={handleSelectPackage}
          currentSubscription={currentSubscription}
        />
        
        {currentSubscription && (
          <Button 
            variant="outline" 
            onClick={() => setView(SubscriptionView.CURRENT)}
            className="mt-4"
          >
            Back to Current Subscription
          </Button>
        )}
      </div>
    );
  }

  if (view === SubscriptionView.CHECKOUT && selectedPackageId) {
    return (
      <SubscriptionCheckout 
        packageId={selectedPackageId}
        onBack={handleBackToPackages}
        isRenewal={currentSubscription?.package._id === selectedPackageId}
        subscriptionId={currentSubscription?._id}
      />
    );
  }

  // Current subscription view (or no subscription)
  if (!currentSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Subscribe to a package to start selling on Nairobi Verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBrowsePackages}>
            <ShoppingBag className="mr-2 h-4 w-4" /> Browse Subscription Packages
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { daysRemaining, progress } = calculateDaysRemaining();
  const isExpiringSoon = daysRemaining <= 7;
  const isExpired = currentSubscription.status === 'expired';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentSubscription.package.name}</CardTitle>
        <CardDescription>
          {currentSubscription.package.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Subscription Status */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h3 className="font-medium">Subscription Status</h3>
              <div className="flex items-center mt-1">
                {isExpired ? (
                  <span className="flex items-center text-red-600">
                    <Clock className="h-4 w-4 mr-1" /> Expired
                  </span>
                ) : (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Active
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">
                KES {currentSubscription.package.price.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Paid via {currentSubscription.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card'}
              </div>
            </div>
          </div>
          
          {/* Subscription Period */}
          {!isExpired && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(currentSubscription.startDate).toLocaleDateString()} - {new Date(currentSubscription.endDate).toLocaleDateString()}
                </div>
                <div className={`text-sm font-medium ${isExpiringSoon ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {daysRemaining} days remaining
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {/* Package Features */}
          <div>
            <h3 className="font-medium mb-2">Package Features</h3>
            <ul className="space-y-1">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Up to {currentSubscription.package.productLimit} products</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Up to {currentSubscription.package.featuredProductsLimit} featured products</span>
              </li>
              {/* Add more features here */}
            </ul>
          </div>
          
          {/* Auto-renewal Status */}
          <div>
            <h3 className="font-medium mb-2">Auto-renewal</h3>
            <div className="flex items-center">
              {currentSubscription.autoRenew ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" /> Enabled
                </span>
              ) : (
                <span className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" /> Disabled
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isExpired ? (
              <Button onClick={handleRenewSubscription} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" /> Renew Subscription
              </Button>
            ) : (
              <Button onClick={handleRenewSubscription} variant="outline" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" /> Renew Early
              </Button>
            )}
            
            <Button onClick={handleBrowsePackages} variant="outline" className="flex-1">
              <ShoppingBag className="mr-2 h-4 w-4" /> Change Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;