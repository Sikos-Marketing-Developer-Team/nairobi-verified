import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, CreditCard, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionPackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  durationUnit: string;
}

interface SubscriptionCheckoutProps {
  packageId: string;
  onBack: () => void;
  isRenewal?: boolean;
  subscriptionId?: string;
}

const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  packageId,
  onBack,
  isRenewal = false,
  subscriptionId
}) => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [packageDetails, setPackageDetails] = useState<SubscriptionPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardToken, setCardToken] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  
  // Fetch package details
  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/packages/${packageId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch package details');
        }
        
        const data = await response.json();
        setPackageDetails(data.package);
        setError(null);
      } catch (err) {
        console.error('Error fetching package details:', err);
        setError('Failed to load package details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackageDetails();
    }
  }, [packageId]);

  // Format duration for display
  const formatDuration = (duration: number, unit: string) => {
    return `${duration} ${unit}${duration > 1 ? 's' : ''}`;
  };

  // Handle payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packageDetails) return;
    
    try {
      setProcessing(true);
      
      // Validate inputs based on payment method
      if (paymentMethod === 'mpesa' && !phoneNumber) {
        toast({
          variant: "destructive",
          title: "Phone number required",
          description: "Please enter your M-Pesa phone number to proceed with payment."
        });
        setProcessing(false);
        return;
      }
      
      if (paymentMethod === 'card' && !cardToken) {
        toast({
          variant: "destructive",
          title: "Card details required",
          description: "Please enter your card details to proceed with payment."
        });
        setProcessing(false);
        return;
      }
      
      // Prepare request body
      const requestBody: any = {
        packageId,
        paymentMethod,
        autoRenew
      };
      
      if (paymentMethod === 'mpesa') {
        requestBody.phoneNumber = phoneNumber;
      } else if (paymentMethod === 'card') {
        requestBody.cardToken = cardToken;
      }
      
      // Determine endpoint based on whether this is a new subscription or renewal
      const endpoint = isRenewal && subscriptionId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/renew/${subscriptionId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/subscribe`;
      
      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment processing failed');
      }
      
      // Handle successful response
      if (paymentMethod === 'mpesa') {
        toast({
          title: "M-Pesa payment initiated",
          description: "Please check your phone and enter your M-Pesa PIN to complete the payment."
        });
        
        // Redirect to confirmation page
        router.push('/merchant/subscriptions/pending');
      } else if (paymentMethod === 'card') {
        toast({
          title: "Payment successful",
          description: "Your subscription has been activated successfully."
        });
        
        // Redirect to subscription page
        router.push('/merchant/subscriptions');
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: err.message || "An error occurred while processing your payment. Please try again."
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Loading...</CardTitle>
          <CardDescription>Please wait while we fetch the package details.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !packageDetails) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Error</CardTitle>
          <CardDescription>{error || 'Failed to load package details'}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">
          {isRenewal ? 'Renew Subscription' : 'Subscribe to Package'}
        </CardTitle>
        <CardDescription>Complete your payment to activate your subscription</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Package Summary */}
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium text-lg">{packageDetails.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{packageDetails.description}</p>
              <div className="flex justify-between items-center">
                <span>Duration:</span>
                <span>{formatDuration(packageDetails.duration, packageDetails.durationUnit)}</span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <span>Total:</span>
                <span>KES {packageDetails.price.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <h3 className="font-medium">Payment Method</h3>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    M-Pesa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit/Debit Card
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Payment Details */}
            {paymentMethod === 'mpesa' && (
              <div className="space-y-3">
                <h3 className="font-medium">M-Pesa Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="e.g. 254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your M-Pesa phone number in the format 254XXXXXXXXX
                  </p>
                </div>
              </div>
            )}
            
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <h3 className="font-medium">Card Details</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Demo Mode</AlertTitle>
                  <AlertDescription>
                    In this demo, enter any 16-digit number as your card token.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="cardToken">Card Token</Label>
                  <Input
                    id="cardToken"
                    placeholder="Enter card token"
                    value={cardToken}
                    onChange={(e) => setCardToken(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Auto-renewal Option */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="autoRenew" 
                checked={autoRenew}
                onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
              />
              <Label htmlFor="autoRenew">
                Enable auto-renewal for uninterrupted service
              </Label>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Complete Payment'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onBack}
              disabled={processing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Packages
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCheckout;