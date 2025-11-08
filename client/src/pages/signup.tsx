import { useLocation } from 'wouter';
import { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import SignupForm from '@/components/SignupForm';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSignup = async (data: any) => {
    try {
      const response = await apiRequest('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      toast({
        title: 'Account created!',
        description: 'Please log in with your credentials.',
      });

      setTimeout(() => {
        setLocation('/login');
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'An error occurred during signup',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join FlowChain to manage your projects"
    >
      <SignupForm onSubmit={handleSignup} />
    </AuthLayout>
  );
}
