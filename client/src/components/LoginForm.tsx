import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, XCircle, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className={`relative transition-smooth ${emailFocused ? 'scale-[1.01]' : 'scale-100'}`}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-smooth">
            <Mail className={`h-5 w-5 ${emailFocused || emailValue ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            data-testid="input-email"
            className="pl-11 transition-smooth border-2 focus:border-primary"
            onFocus={() => setEmailFocused(true)}
            {...register('email', {
              onBlur: () => setEmailFocused(false)
            })}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive mt-2 flex items-center gap-1.5 animate-slide-in-bottom">
            <XCircle className="h-4 w-4" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className={`relative transition-smooth ${passwordFocused ? 'scale-[1.01]' : 'scale-100'}`}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-smooth">
            <Lock className={`h-5 w-5 ${passwordFocused || passwordValue ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            data-testid="input-password"
            className="pl-11 pr-11 transition-smooth border-2 focus:border-primary"
            onFocus={() => setPasswordFocused(true)}
            {...register('password', {
              onBlur: () => setPasswordFocused(false)
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
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
          <p className="text-sm text-destructive mt-2 flex items-center gap-1.5 animate-slide-in-bottom">
            <XCircle className="h-4 w-4" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
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
          className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium"
          data-testid="link-forgot-password"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full text-base font-medium transition-smooth group relative overflow-hidden"
        disabled={isSubmitting}
        data-testid="button-login"
      >
        <span className="flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Log In
              <ArrowRight className="h-5 w-5 transition-smooth group-hover:translate-x-1" />
            </>
          )}
        </span>
      </Button>

    </form>
  );
}
