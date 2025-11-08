import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { Shield, Zap, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Side - Hero Panel with Gradient Mesh */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-primary items-center justify-center p-12 overflow-hidden">
        {/* Animated Gradient Mesh Background */}
        <div className="absolute inset-0 gradient-mesh opacity-40 animate-gradient" />
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        {/* Content */}
        <div className="relative z-10 max-w-lg space-y-12 animate-fade-in">
          <div className="space-y-4">
            <Logo className="h-14 w-auto brightness-0 invert" />
            <h2 className="text-5xl font-bold text-white leading-tight">
              Streamline Your Workflow
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              FlowChain brings teams together with powerful project management tools designed for modern collaboration.
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="glass-card p-6 rounded-xl animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Enterprise Security</h3>
                  <p className="text-white/80 text-sm">Bank-level encryption keeps your data safe and secure</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-xl animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Lightning Fast</h3>
                  <p className="text-white/80 text-sm">Real-time updates and instant collaboration</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-xl animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1">Team Collaboration</h3>
                  <p className="text-white/80 text-sm">Built for teams of all sizes to work together</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-background relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Logo className="h-10 w-auto" />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3 animate-slide-in-bottom" data-testid="text-auth-title">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground animate-slide-in-bottom" style={{ animationDelay: '0.1s' }} data-testid="text-auth-subtitle">
              {subtitle}
            </p>
          </div>
          
          <div className="animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
