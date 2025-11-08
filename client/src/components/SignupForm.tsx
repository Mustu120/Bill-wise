import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, CheckCircle2, XCircle, Shield, Mail, Lock, User, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['project_manager', 'team_member', 'finance', 'admin'], {
    required_error: 'Please select a role',
  }),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const nameValue = watch('name');
  const emailValue = watch('email');

  const passwordRequirements = [
    { label: '8+ characters', met: passwordValue.length >= 8 },
    { label: '1 uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: '1 number', met: /[0-9]/.test(passwordValue) },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              onChange: (e) => setPasswordValue(e.target.value),
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
        <div className="space-y-2 mt-3 bg-muted/30 p-3 rounded-lg">
          {passwordRequirements.map((req) => (
            <div
              key={req.label}
              className="flex items-center gap-2 text-sm transition-smooth"
              data-testid={`password-requirement-${req.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {req.met ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground/50" />
              )}
              <span className={req.met ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Role Field */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium">
          Role
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <Select onValueChange={(value) => setValue('role', value as any)}>
            <SelectTrigger data-testid="select-role" className="pl-11 transition-smooth border-2">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project_manager">Project Manager</SelectItem>
              <SelectItem value="team_member">Team Member</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.role && (
          <p className="text-sm text-destructive mt-2 flex items-center gap-1.5 animate-slide-in-bottom">
            <XCircle className="h-4 w-4" />
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3.5 rounded-lg">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-medium">Encrypted & Secure</span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full text-base font-medium transition-smooth group relative overflow-hidden"
        disabled={isSubmitting}
        data-testid="button-signup"
      >
        <span className="flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-5 w-5 transition-smooth group-hover:translate-x-1" />
            </>
          )}
        </span>
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground pt-2">
        Already have an account?{' '}
        <Link 
          href="/login" 
          className="text-primary hover:text-primary/80 transition-smooth font-medium" 
          data-testid="link-login"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
