import React from 'react';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import SubscriptionManagement from './SubscriptionManagement';

export const metadata: Metadata = {
  title: 'Subscription Management | Nairobi Verified',
  description: 'Manage your merchant subscription plans and renewals',
};

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="current">Current Subscription</TabsTrigger>
          <TabsTrigger value="history">Subscription History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-6">
          <SubscriptionManagement />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>
                View your previous subscription plans and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would be populated with actual subscription history data */}
                <HistoryItem 
                  packageName="Premium Plan"
                  startDate="Jan 1, 2023"
                  endDate="Apr 1, 2023"
                  status="expired"
                  amount={15000}
                  paymentMethod="M-Pesa"
                />
                
                <HistoryItem 
                  packageName="Basic Plan"
                  startDate="Oct 1, 2022"
                  endDate="Jan 1, 2023"
                  status="expired"
                  amount={5000}
                  paymentMethod="Card"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface HistoryItemProps {
  packageName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  amount: number;
  paymentMethod: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  packageName,
  startDate,
  endDate,
  status,
  amount,
  paymentMethod
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h3 className="font-medium text-lg">{packageName}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {startDate} - {endDate}
            </div>
            <div className="flex items-center mt-2">
              {status === 'active' && (
                <span className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" /> Active
                </span>
              )}
              {status === 'expired' && (
                <span className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-4 w-4 mr-1" /> Expired
                </span>
              )}
              {status === 'cancelled' && (
                <span className="flex items-center text-red-600 text-sm">
                  <Clock className="h-4 w-4 mr-1" /> Cancelled
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-medium">KES {amount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Paid via {paymentMethod}</div>
            
            {status === 'expired' && (
              <Button variant="outline" size="sm" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" /> Renew Similar Plan
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};