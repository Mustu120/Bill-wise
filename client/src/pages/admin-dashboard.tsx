import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  LogOut, 
  UserPlus, 
  Shield,
  Briefcase,
  User as UserIcon,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { UserWithoutPassword } from '@shared/schema';
import CreateUserDialog from '../components/CreateUserDialog';
import UpdateRoleDialog from '../components/UpdateRoleDialog';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
  const [updateRoleOpen, setUpdateRoleOpen] = useState(false);

  const { data: currentUser } = useQuery<{ user: UserWithoutPassword }>({
    queryKey: ['/api/auth/me'],
  });

  const { data: usersData, isLoading } = useQuery<{ users: UserWithoutPassword[] }>({
    queryKey: ['/api/admin/users'],
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
        return <Shield className="h-4 w-4" />;
      case 'project_manager':
        return <Briefcase className="h-4 w-4" />;
      case 'finance':
        return <DollarSign className="h-4 w-4" />;
      case 'team_member':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
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

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'project_manager':
        return 'default';
      case 'finance':
        return 'secondary';
      case 'team_member':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleUpdateRole = (user: UserWithoutPassword) => {
    setSelectedUser(user);
    setUpdateRoleOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Create and manage user accounts and roles
                </CardDescription>
              </div>
              <Button
                onClick={() => setCreateUserOpen(true)}
                data-testid="button-create-user"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading users...</p>
            ) : (
              <div className="space-y-3">
                {usersData?.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                    data-testid={`user-card-${user.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-medium" data-testid={`text-name-${user.id}`}>
                          {user.name}
                        </h3>
                        <Badge variant={getRoleVariant(user.role)} data-testid={`badge-role-${user.id}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1.5">{getRoleLabel(user.role)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </p>
                    </div>
                    {user.id !== currentUser?.user?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateRole(user)}
                        data-testid={`button-update-role-${user.id}`}
                      >
                        Update Role
                      </Button>
                    )}
                  </div>
                ))}
                {usersData?.users.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No users found. Create your first user to get started.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
      />

      {selectedUser && (
        <UpdateRoleDialog
          open={updateRoleOpen}
          onOpenChange={setUpdateRoleOpen}
          user={selectedUser}
        />
      )}
    </div>
  );
}
