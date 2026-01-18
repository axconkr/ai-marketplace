'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  passwordChangeSchema,
  type PasswordChangeFormData,
  getPasswordStrengthDetails,
  PASSWORD_REQUIREMENTS,
} from '@/lib/validators/password';

export default function PasswordChangePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<
    typeof getPasswordStrengthDetails
  > | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');

  // Update password strength when new password changes
  useState(() => {
    if (newPassword && newPassword.length > 0) {
      setPasswordStrength(getPasswordStrengthDetails(newPassword));
    } else {
      setPasswordStrength(null);
    }
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Too Many Attempts',
            description: result.error || 'Please try again later.',
            variant: 'error',
          });
          return;
        }

        if (response.status === 401) {
          toast({
            title: 'Invalid Password',
            description: 'Current password is incorrect.',
            variant: 'error',
          });
          return;
        }

        throw new Error(result.error || 'Failed to change password');
      }

      toast({
        title: 'Password Changed',
        description: 'Your password has been successfully updated.',
      });

      // Reset form
      reset();

      // Redirect to profile after short delay
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to change password. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure. Make sure to use a strong, unique
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  {...register('currentPassword')}
                  disabled={isLoading}
                  className={errors.currentPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  {...register('newPassword')}
                  disabled={isLoading}
                  className={errors.newPassword ? 'border-red-500' : ''}
                  onChange={(e) => {
                    register('newPassword').onChange(e);
                    if (e.target.value) {
                      setPasswordStrength(getPasswordStrengthDetails(e.target.value));
                    } else {
                      setPasswordStrength(null);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password Strength:</span>
                    <span
                      className={`font-medium text-${passwordStrength.color}-600`}
                      style={{
                        color:
                          passwordStrength.color === 'red'
                            ? '#dc2626'
                            : passwordStrength.color === 'orange'
                            ? '#ea580c'
                            : passwordStrength.color === 'green'
                            ? '#16a34a'
                            : '#059669',
                      }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength.percentage}%`,
                        backgroundColor:
                          passwordStrength.color === 'red'
                            ? '#dc2626'
                            : passwordStrength.color === 'orange'
                            ? '#ea580c'
                            : passwordStrength.color === 'green'
                            ? '#16a34a'
                            : '#059669',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm text-gray-900">Password Requirements:</h4>
              <ul className="space-y-1">
                <RequirementItem
                  met={newPassword?.length >= PASSWORD_REQUIREMENTS.minLength}
                  text={`At least ${PASSWORD_REQUIREMENTS.minLength} characters`}
                />
                <RequirementItem
                  met={/[A-Z]/.test(newPassword || '')}
                  text="One uppercase letter"
                />
                <RequirementItem
                  met={/[a-z]/.test(newPassword || '')}
                  text="One lowercase letter"
                />
                <RequirementItem met={/[0-9]/.test(newPassword || '')} text="One number" />
                <RequirementItem
                  met={/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(newPassword || '')}
                  text={`One special character (${PASSWORD_REQUIREMENTS.specialChars})`}
                />
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Use a unique password that you don't use anywhere else</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Combine letters, numbers, and special characters</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Avoid using personal information like birthdays or names</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Consider using a password manager to generate and store strong passwords</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Password requirement item component
 */
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>{text}</span>
    </li>
  );
}
