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
import { Eye, EyeOff, CheckCircle2, XCircle, Shield } from 'lucide-react';
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const passwordRequirements = [
    { label: '8+ characters', met: passwordValue.length >= 8 },
    { label: '1 uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: '1 number', met: /[0-9]/.test(passwordValue) },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          data-testid="input-name"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            {errors.name.message}
          </p>
        )}
      </div>

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
            {...register('password', {
              onChange: (e) => setPasswordValue(e.target.value),
            })}
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
        <div className="space-y-2 mt-3">
          {passwordRequirements.map((req) => (
            <div
              key={req.label}
              className="flex items-center gap-2 text-sm"
              data-testid={`password-requirement-${req.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {req.met ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select onValueChange={(value) => setValue('role', value as any)}>
          <SelectTrigger data-testid="select-role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project_manager">Project Manager</SelectItem>
            <SelectItem value="team_member">Team Member</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            {errors.role.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <Shield className="h-4 w-4" />
        <span>Encrypted & Secure</span>
      </div>

      <Button
        type="submit"
        className="w-full h-12"
        disabled={isSubmitting}
        data-testid="button-signup"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
          Log in
        </Link>
      </p>
    </form>
  );
}
