import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, XCircle } from 'lucide-react';
import { Link } from 'wouter';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          data-testid="input-email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            data-testid="input-password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            data-testid="button-toggle-password"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => {
              setRememberMe(checked as boolean);
              setValue('rememberMe', checked as boolean);
            }}
            data-testid="checkbox-remember-me"
          />
          <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
            Remember me
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
          data-testid="link-forgot-password"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full h-12"
        disabled={isSubmitting}
        data-testid="button-login"
      >
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Need an account?{' '}
        <Link href="/signup" className="text-primary hover:underline" data-testid="link-signup">
          Sign up
        </Link>
      </p>
    </form>
  );
}
