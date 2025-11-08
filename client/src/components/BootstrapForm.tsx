import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, XCircle, Mail, Lock, User, Loader2, Shield } from 'lucide-react';

const bootstrapSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type BootstrapFormData = z.infer<typeof bootstrapSchema>;

interface BootstrapFormProps {
  onSubmit: (data: BootstrapFormData) => void;
}

export default function BootstrapForm({ onSubmit }: BootstrapFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BootstrapFormData>({
    resolver: zodResolver(bootstrapSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const nameValue = watch('name');
  const emailValue = watch('email');
  const passwordValue = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-primary/10 border border-primary/20 rounded-md p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="font-medium text-sm">First Time Setup</h3>
            <p className="text-xs text-muted-foreground">
              Create your administrator account to get started with FlowChain.
            </p>
          </div>
        </div>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Full Name
        </Label>
        <div className={`relative transition-smooth ${nameFocused ? 'scale-[1.01]' : 'scale-100'}`}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-smooth">
            <User className={`h-5 w-5 ${nameFocused || nameValue ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            data-testid="input-name"
            className="pl-11 transition-smooth border-2 focus:border-primary"
            onFocus={() => setNameFocused(true)}
            {...register('name', {
              onBlur: () => setNameFocused(false)
            })}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-destructive mt-2 flex items-center gap-1.5 animate-slide-in-bottom">
            <XCircle className="h-4 w-4" />
            {errors.name.message}
          </p>
        )}
      </div>

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
            placeholder="admin@example.com"
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

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full text-base font-medium transition-smooth group relative overflow-hidden"
        disabled={isSubmitting}
        data-testid="button-create-admin"
      >
        <span className="flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Admin...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Create Admin Account
            </>
          )}
        </span>
      </Button>
    </form>
  );
}
