import Logo from './Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Logo />
        </div>
        <div className="bg-card border border-card-border rounded-xl p-8 shadow-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-auth-title">{title}</h1>
            <p className="text-base text-muted-foreground" data-testid="text-auth-subtitle">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
