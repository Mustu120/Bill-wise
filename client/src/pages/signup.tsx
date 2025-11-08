import { useLocation } from 'wouter';
import AuthLayout from '@/components/AuthLayout';
import SignupForm from '@/components/SignupForm';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSignup = async (data: any) => {
    try {
      const response = await apiRequest('POST', '/api/auth/signup', data);
      const result = await response.json();

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
