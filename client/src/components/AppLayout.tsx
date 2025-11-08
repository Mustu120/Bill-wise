import { useState } from 'react';
import { useLocation } from 'wouter';
import { LayoutGrid, Folder, CheckSquare, BarChart2, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location, setLocation] = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'profile', label: 'My Profile', icon: User, path: '/profile' }
  ];

  const currentUser = {
    name: "John Doe",
    email: "john.doe@flowchain.com",
    initials: "JD"
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-20' : 'w-64'} bg-card border-r border-border flex flex-col transition-all duration-300 h-screen fixed left-0 top-0 z-40`}>
        {/* Brand Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-lg">
                F
              </div>
              {!collapsed && (
                <div>
                  <div className="font-bold text-foreground">FlowChain</div>
                  <div className="text-xs text-muted-foreground">Bill Management</div>
                </div>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCollapsed(!collapsed)}
              data-testid="button-toggle-sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3`}
                onClick={() => setLocation(item.path)}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                {currentUser.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm truncate">{currentUser.name}</div>
                <div className="text-xs text-muted-foreground truncate">{currentUser.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {children}
      </div>
    </div>
  );
}
