import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  User,
  Shield,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { UserWithoutPassword } from '@shared/schema';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: currentUser } = useQuery<{ user: UserWithoutPassword }>({
    queryKey: ['/api/auth/me'],
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      queryClient.clear();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      setLocation('/login');
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'project_manager':
        return <Briefcase className="h-5 w-5" />;
      case 'finance':
        return <DollarSign className="h-5 w-5" />;
      case 'team_member':
        return <User className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'project_manager':
        return 'Project Manager';
      case 'finance':
        return 'Finance';
      case 'team_member':
        return 'Team Member';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center">
                {currentUser?.user && getRoleIcon(currentUser.user.role)}
              </div>
              <div>
                <h1 className="text-xl font-bold">FlowChain</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {currentUser?.user?.name}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium" data-testid="text-user-name">
                {currentUser?.user?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium" data-testid="text-user-email">
                {currentUser?.user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              {currentUser?.user && (
                <Badge variant="outline" className="mt-1" data-testid="badge-user-role">
                  {getRoleIcon(currentUser.user.role)}
                  <span className="ml-2">{getRoleLabel(currentUser.user.role)}</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
