import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { settingsAPI } from '@/lib/api';
import { UserSettings as UserSettingsType } from '@/types'; // Renamed import to avoid conflict

const UserSettings = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchSettings = async () => {
        setIsLoading(true);
        try {
          const response = await settingsAPI.getSettings();
          setSettings(response.data.data);
        } catch (err) {
          console.error('Error fetching user settings:', err);
          setError('Failed to load settings.');
          toast({
            title: 'Error',
            description: 'Failed to load user settings. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchSettings();
    } else if (!isAuthenticated && !authLoading) {
      setIsLoading(false);
      setError('Please log in to view your settings.');
    }
  }, [isAuthenticated, user, authLoading]);

  const handleInputChange = (field: keyof UserSettingsType, value: string | boolean) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!settings || !isAuthenticated || !user) return;

    setIsSaving(true);
    try {
      await settingsAPI.updateSettings(user._id, settings);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (err) {
      console.error('Error saving user settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-gray-600">Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-8">{error}</div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No settings found or available.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Preferences */}
        <div className="space-y-2">
          <Label htmlFor="emailNotifications">Email Notifications</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications || false}
              onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              aria-label="Email Notifications"
            />
            <span className="text-sm text-gray-600">
              Receive email updates and promotions
            </span>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="space-y-2">
          <Label htmlFor="smsNotifications">SMS Notifications</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="smsNotifications"
              checked={settings.smsNotifications || false}
              onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
              aria-label="SMS Notifications"
            />
            <span className="text-sm text-gray-600">
              Receive SMS alerts for order updates and more
            </span>
          </div>
        </div>

        {/* Marketing Preferences */}
        <div className="space-y-2">
          <Label htmlFor="marketingEmails">Marketing Emails</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="marketingEmails"
              checked={settings.marketingEmails || false}
              onCheckedChange={(checked) => handleInputChange('marketingEmails', checked)}
              aria-label="Marketing Emails"
            />
            <span className="text-sm text-gray-600">
              Receive newsletters and marketing communications
            </span>
          </div>
        </div>

        <Button 
          className="bg-primary hover:bg-primary-dark" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            null
          )}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserSettings;

 