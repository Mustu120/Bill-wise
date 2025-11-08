import { useLocation } from 'wouter';
import AuthLayout from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const [, setLocation] = useLocation();

  const handleLogin = (data: any) => {
    console.log('Login data:', data);
    localStorage.setItem('mockUser', JSON.stringify({
      name: 'Demo User',
      email: data.email,
      role: 'Project Manager'
    }));
    setTimeout(() => {
      setLocation('/');
    }, 500);
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
