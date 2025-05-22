import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface SubscriptionPackageProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  durationUnit: string;
  features: string[];
  productLimit: number;
  featuredProductsLimit: number;
  isActive: boolean;
  isCurrentPlan?: boolean;
  onSelect: (packageId: string) => void;
}

const SubscriptionPackageCard: React.FC<SubscriptionPackageProps> = ({
  id,
  name,
  description,
  price,
  duration,
  durationUnit,
  features,
  productLimit,
  featuredProductsLimit,
  isActive,
  isCurrentPlan = false,
  onSelect,
}) => {
  // Format duration for display
  const formatDuration = () => {
    const unit = durationUnit === 'month' && duration === 1 
      ? 'Monthly' 
      : durationUnit === 'year' && duration === 1 
        ? 'Yearly' 
        : `${duration} ${durationUnit}${duration > 1 ? 's' : ''}`;
    
    return unit;
  };

  return (
    <Card className={`w-full max-w-sm border-2 ${isCurrentPlan ? 'border-primary shadow-lg' : 'border-border'}`}>
      {isCurrentPlan && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          Current Plan
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <CardDescription className="text-sm mt-2">{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">KES {price.toLocaleString()}</span>
          <span className="text-muted-foreground ml-1">/{formatDuration().toLowerCase()}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">Up to {productLimit} products</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">Up to {featuredProductsLimit} featured products</span>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onSelect(id)} 
          className="w-full" 
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={!isActive}
        >
          {isCurrentPlan ? 'Renew Plan' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionPackageCard;