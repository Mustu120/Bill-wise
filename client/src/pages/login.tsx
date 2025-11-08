import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import AuthLayout from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';
import BootstrapForm from '@/components/BootstrapForm';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [needsBootstrap, setNeedsBootstrap] = useState(false);

  const { data: bootstrapStatus, isLoading } = useQuery<{ needsBootstrap: boolean }>({
    queryKey: ['/api/auth/bootstrap/status'],
  });

  useEffect(() => {
    if (bootstrapStatus?.needsBootstrap) {
      setNeedsBootstrap(true);
    }
  }, [bootstrapStatus]);

  const handleLogin = async (data: any) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', data);
      const result = await response.json();

      toast({
        title: 'Login successful!',
        description: `Welcome back, ${result.user.name}!`,
      });

      const redirectPath = result.user.role === 'admin' ? '/admin' : '/dashboard';
      setTimeout(() => {
        setLocation(redirectPath);
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    }
  };

  const handleBootstrap = async (data: any) => {
    try {
      const response = await apiRequest('POST', '/api/auth/bootstrap', data);
      const result = await response.json();

      toast({
        title: 'Admin account created!',
        description: `Welcome, ${result.user.name}! Your administrator account is ready.`,
      });

      setNeedsBootstrap(false);
      setTimeout(() => {
        setLocation('/admin');
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Setup failed',
        description: error.message || 'Could not create admin account',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AuthLayout
        title="Loading..."
        subtitle="Please wait"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={needsBootstrap ? "Setup Administrator" : "Welcome Back"}
      subtitle={needsBootstrap ? "Create your first admin account" : "Log in to continue"}
    >
      {needsBootstrap ? (
        <BootstrapForm onSubmit={handleBootstrap} />
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </AuthLayout>
  );
}
