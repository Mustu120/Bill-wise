import { useLocation } from 'wouter';
import AuthLayout from '@/components/AuthLayout';
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  const [, setLocation] = useLocation();

  const handleSignup = (data: any) => {
    console.log('Signup data:', data);
    setTimeout(() => {
      setLocation('/login');
    }, 500);
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
