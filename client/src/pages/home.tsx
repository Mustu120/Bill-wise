import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Logo from '@/components/Logo';
import { LogOut } from 'lucide-react';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    } else {
      setLocation('/login');
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('mockUser');
    setLocation('/login');
  };

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Logo className="h-10 w-auto" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar data-testid="avatar-user">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium text-foreground" data-testid="text-user-name">
                  {user.name}
                </p>
                <Badge variant="secondary" className="text-xs" data-testid="badge-user-role">
                  {user.role}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome">
            Welcome, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Role: {user.role}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 h-48 flex items-center justify-center" data-testid="card-module-1">
            <div className="text-center">
              <p className="text-muted-foreground">Dashboard Module 1</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
            </div>
          </Card>
          <Card className="p-6 h-48 flex items-center justify-center" data-testid="card-module-2">
            <div className="text-center">
              <p className="text-muted-foreground">Dashboard Module 2</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
            </div>
          </Card>
          <Card className="p-6 h-48 flex items-center justify-center" data-testid="card-module-3">
            <div className="text-center">
              <p className="text-muted-foreground">Dashboard Module 3</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
