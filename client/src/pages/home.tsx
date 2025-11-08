import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  LogOut, 
  Loader2, 
  TrendingUp, 
  Users, 
  FolderKanban, 
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Activity,
  Calendar,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatRole } from '@/lib/utils';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        const result = await response.json();
        setUser(result.user);
      } catch (error) {
        setLocation('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      toast({
        title: 'Logged out successfully',
      });
      setLocation('/login');
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'An error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  // Mock statistics - in real app, these would come from API
  const stats = [
    { label: 'Active Projects', value: '12', change: '+12%', icon: FolderKanban, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Team Members', value: '48', change: '+8%', icon: Users, color: 'text-green-600 dark:text-green-400' },
    { label: 'Completion Rate', value: '94%', change: '+5%', icon: CheckCircle2, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'This Week', value: '32', change: '+18%', icon: TrendingUp, color: 'text-orange-600 dark:text-orange-400' },
  ];

  const recentActivity = [
    { title: 'Project Alpha milestone completed', time: '2 hours ago', type: 'success' },
    { title: 'New team member added to Beta project', time: '5 hours ago', type: 'info' },
    { title: 'Budget review meeting scheduled', time: '1 day ago', type: 'warning' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Logo className="h-10 w-auto" />
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-2">
                <Avatar data-testid="avatar-user" className="h-9 w-9">
                  <AvatarFallback className="gradient-primary text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-semibold text-foreground leading-tight" data-testid="text-user-name">
                    {user.name}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1" data-testid="badge-user-role">
                    {formatRole(user.role)}
                  </Badge>
                </div>
              </div>
              
              <ThemeToggle />
              
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3" data-testid="text-welcome">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your projects today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.label} 
              className="hover-elevate cursor-pointer transition-smooth animate-slide-in-bottom"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`card-stat-${index}`}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-4 w-4" />
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 animate-slide-in-bottom" style={{ animationDelay: '0.4s' }} data-testid="card-module-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover-elevate transition-smooth"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm leading-snug">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="animate-slide-in-bottom" style={{ animationDelay: '0.5s' }} data-testid="card-module-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-3" variant="outline" data-testid="button-new-project">
                  <FolderKanban className="h-4 w-4" />
                  New Project
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline" data-testid="button-invite-team">
                  <Users className="h-4 w-4" />
                  Invite Team
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline" data-testid="button-schedule-meeting">
                  <Calendar className="h-4 w-4" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start gap-3 gradient-primary text-white border-0" data-testid="button-view-reports">
                  <TrendingUp className="h-4 w-4" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="lg:col-span-3 animate-slide-in-bottom" style={{ animationDelay: '0.6s' }} data-testid="card-module-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Review Q4 Budget', due: 'Tomorrow', priority: 'high' },
                  { title: 'Team Performance Review', due: 'In 2 days', priority: 'medium' },
                  { title: 'Project Alpha Demo', due: 'Friday', priority: 'high' },
                ].map((task, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border border-border hover-elevate transition-smooth cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-foreground text-sm">{task.title}</h4>
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due {task.due}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
