'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NotificationSettings {
  email: {
    orders: boolean;
    payments: boolean;
    refunds: boolean;
    products: boolean;
    verifications: boolean;
    settlements: boolean;
    reviews: boolean;
    messages: boolean;
    system: boolean;
  };
  inApp: {
    orders: boolean;
    payments: boolean;
    refunds: boolean;
    products: boolean;
    verifications: boolean;
    settlements: boolean;
    reviews: boolean;
    messages: boolean;
    system: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  email: {
    orders: true,
    payments: true,
    refunds: true,
    products: true,
    verifications: true,
    settlements: true,
    reviews: true,
    messages: true,
    system: true,
  },
  inApp: {
    orders: true,
    payments: true,
    refunds: true,
    products: true,
    verifications: true,
    settlements: true,
    reviews: true,
    messages: true,
    system: true,
  },
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (channel: 'email' | 'inApp', category: keyof NotificationSettings['email']) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [category]: !prev[channel][category],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Show success message
      alert('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { key: 'orders', label: 'Orders', description: 'New orders, order completions' },
    { key: 'payments', label: 'Payments', description: 'Payment confirmations and failures' },
    { key: 'refunds', label: 'Refunds', description: 'Refund requests and approvals' },
    { key: 'products', label: 'Products', description: 'Product approvals and rejections' },
    { key: 'verifications', label: 'Verifications', description: 'Verification requests and completions' },
    { key: 'settlements', label: 'Settlements', description: 'Monthly settlement notifications' },
    { key: 'reviews', label: 'Reviews', description: 'New reviews on your products' },
    { key: 'messages', label: 'Messages', description: 'Direct messages and chat notifications' },
    { key: 'system', label: 'System', description: 'Important system announcements' },
  ] as const;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage how you receive notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive and how you want to receive them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr_100px_100px] gap-4 pb-2 text-sm font-medium">
              <div>Category</div>
              <div className="text-center">Email</div>
              <div className="text-center">In-App</div>
            </div>

            <Separator />

            {/* Notification Categories */}
            {categories.map((category) => (
              <div key={category.key}>
                <div className="grid grid-cols-[1fr_100px_100px] items-start gap-4">
                  <div>
                    <Label htmlFor={category.key} className="font-medium">
                      {category.label}
                    </Label>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      id={`email-${category.key}`}
                      checked={settings.email[category.key]}
                      onCheckedChange={() => handleToggle('email', category.key)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      id={`inApp-${category.key}`}
                      checked={settings.inApp[category.key]}
                      onCheckedChange={() => handleToggle('inApp', category.key)}
                    />
                  </div>
                </div>
                {category.key !== 'system' && <Separator className="mt-6" />}
              </div>
            ))}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>Email Notifications:</strong> Sent to your registered email address.
            Make sure to check your spam folder if you're not receiving emails.
          </p>
          <p>
            <strong>In-App Notifications:</strong> Shown in the notification bell icon
            at the top of the page. You'll see a badge indicating unread notifications.
          </p>
          <p>
            <strong>Important:</strong> Critical notifications (like payment failures
            or security alerts) cannot be disabled for your account safety.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
