import { useLocation } from 'wouter';
import AuthLayout from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (data: any) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', data);
      const result = await response.json();

      toast({
        title: 'Login successful!',
        description: `Welcome back, ${result.user.name}!`,
      });

      setTimeout(() => {
        setLocation('/');
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to continue"
    >
      <LoginForm onSubmit={handleLogin} />
    </AuthLayout>
  );
}
