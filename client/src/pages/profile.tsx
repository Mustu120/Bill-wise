import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Briefcase, Shield, Calendar, Save, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserWithoutPassword } from '@shared/schema';
import { formatRole } from '@/lib/utils';

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const { data: currentUser, isLoading } = useQuery<{ user: UserWithoutPassword }>({
    queryKey: ['/api/auth/me'],
  });

  const user = currentUser?.user;

  const handleEdit = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen overflow-auto bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen overflow-auto bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="h-screen overflow-auto bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-profile">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and settings</p>
          </div>
          {!isEditing && (
            <Button onClick={handleEdit} data-testid="button-edit-profile">
              <Edit2 size={18} className="mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle data-testid="text-user-name">{user.name}</CardTitle>
              <CardDescription data-testid="text-user-email">{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <Badge variant="default" data-testid="badge-user-role">
                  <Shield size={14} className="mr-1" />
                  {formatRole(user.role)}
                </Badge>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p className="flex items-center justify-center gap-2">
                  <Calendar size={14} />
                  Member since {new Date().getFullYear()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditing ? 'Update your personal details below' : 'View your profile information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User size={16} />
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      data-testid="input-edit-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      data-testid="input-edit-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Briefcase size={16} />
                      Role
                    </label>
                    <Input
                      type="text"
                      value={formatRole(user.role)}
                      disabled
                      className="bg-muted"
                      data-testid="input-role-disabled"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your role is managed by administrators and cannot be changed here.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-edit">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} data-testid="button-save-profile">
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User size={16} />
                      Full Name
                    </label>
                    <p className="text-base" data-testid="text-display-name">{user.name}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <p className="text-base" data-testid="text-display-email">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Briefcase size={16} />
                      Role
                    </label>
                    <p className="text-base" data-testid="text-display-role">{formatRole(user.role)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Your recent activity and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-md">
                <p className="text-3xl font-bold" data-testid="stat-projects">0</p>
                <p className="text-sm text-muted-foreground mt-1">Projects</p>
              </div>
              <div className="text-center p-4 border rounded-md">
                <p className="text-3xl font-bold" data-testid="stat-tasks">0</p>
                <p className="text-sm text-muted-foreground mt-1">Tasks Completed</p>
              </div>
              <div className="text-center p-4 border rounded-md">
                <p className="text-3xl font-bold" data-testid="stat-hours">0</p>
                <p className="text-sm text-muted-foreground mt-1">Hours Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
