import React, { useState, useEffect } from 'react';
import SubscriptionPackageCard from './SubscriptionPackageCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SubscriptionPackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  durationUnit: string;
  features: string[];
  productLimit: number;
  featuredProductsLimit: number;
  isActive: boolean;
}

interface CurrentSubscription {
  _id: string;
  package: {
    _id: string;
    name: string;
  };
  endDate: string;
  status: string;
}

interface SubscriptionPackagesListProps {
  onSelectPackage: (packageId: string) => void;
  currentSubscription?: CurrentSubscription | null;
}

const SubscriptionPackagesList: React.FC<SubscriptionPackagesListProps> = ({
  onSelectPackage,
  currentSubscription
}) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/packages?active=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription packages');
        }
        
        const data = await response.json();
        setPackages(data.packages);
        setError(null);
      } catch (err) {
        console.error('Error fetching subscription packages:', err);
        setError('Failed to load subscription packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full max-w-sm p-4 border rounded-lg">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-6" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (packages.length === 0) {
    return (
      <Alert className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Packages Available</AlertTitle>
        <AlertDescription>
          There are currently no subscription packages available. Please check back later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {packages.map((pkg) => (
        <SubscriptionPackageCard
          key={pkg._id}
          id={pkg._id}
          name={pkg.name}
          description={pkg.description}
          price={pkg.price}
          duration={pkg.duration}
          durationUnit={pkg.durationUnit}
          features={pkg.features}
          productLimit={pkg.productLimit}
          featuredProductsLimit={pkg.featuredProductsLimit}
          isActive={pkg.isActive}
          isCurrentPlan={currentSubscription?.package._id === pkg._id && currentSubscription?.status === 'active'}
          onSelect={onSelectPackage}
        />
      ))}
    </div>
  );
};

export default SubscriptionPackagesList;