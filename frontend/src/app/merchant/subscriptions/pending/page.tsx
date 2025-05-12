'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

enum PaymentStatus {
  CHECKING = 'checking',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export default function PendingSubscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.CHECKING);
  const [checkCount, setCheckCount] = useState(0);
  
  // Check payment status periodically
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/payment-status`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }
        
        const data = await response.json();
        
        if (data.status === 'paid') {
          setStatus(PaymentStatus.COMPLETED);
          toast({
            title: "Payment successful",
            description: "Your subscription has been activated successfully."
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push('/merchant/subscriptions');
          }, 3000);
        } else if (data.status === 'failed') {
          setStatus(PaymentStatus.FAILED);
        } else {
          setStatus(PaymentStatus.PENDING);
          
          // Increment check count
          setCheckCount(prev => prev + 1);
          
          // If we've checked more than 10 times (50 seconds), stop checking
          if (checkCount < 10) {
            // Check again after 5 seconds
            setTimeout(checkPaymentStatus, 5000);
          }
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setStatus(PaymentStatus.PENDING);
        
        // Check again after 5 seconds if we haven't checked too many times
        if (checkCount < 10) {
          setCheckCount(prev => prev + 1);
          setTimeout(checkPaymentStatus, 5000);
        }
      }
    };
    
    // Start checking
    checkPaymentStatus();
    
    // Cleanup
    return () => {
      // Any cleanup if needed
    };
  }, [checkCount, router, toast]);
  
  const handleGoToSubscriptions = () => {
    router.push('/merchant/subscriptions');
  };
  
  const handleTryAgain = () => {
    router.push('/merchant/subscriptions');
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Subscription Payment</CardTitle>
          <CardDescription>
            {status === PaymentStatus.CHECKING && 'Checking payment status...'}
            {status === PaymentStatus.PENDING && 'Your payment is being processed'}
            {status === PaymentStatus.COMPLETED && 'Payment successful!'}
            {status === PaymentStatus.FAILED && 'Payment failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {(status === PaymentStatus.CHECKING || status === PaymentStatus.PENDING) && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-medium mb-2">Processing Your Payment</h3>
              <p className="text-center text-muted-foreground">
                Please complete the payment on your phone if prompted. This page will automatically update when your payment is confirmed.
              </p>
            </>
          )}
          
          {status === PaymentStatus.COMPLETED && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
              <p className="text-center text-muted-foreground">
                Your subscription has been activated successfully. You will be redirected to your subscription page shortly.
              </p>
            </>
          )}
          
          {status === PaymentStatus.FAILED && (
            <>
              <AlertTriangle className="h-16 w-16 text-red-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Payment Failed</h3>
              <p className="text-center text-muted-foreground">
                We couldn't process your payment. Please try again or choose a different payment method.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {(status === PaymentStatus.CHECKING || status === PaymentStatus.PENDING) && (
            <Button variant="outline" onClick={handleGoToSubscriptions}>
              Go to Subscriptions
            </Button>
          )}
          
          {status === PaymentStatus.COMPLETED && (
            <Button onClick={handleGoToSubscriptions}>
              Go to Subscriptions
            </Button>
          )}
          
          {status === PaymentStatus.FAILED && (
            <Button onClick={handleTryAgain}>
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}