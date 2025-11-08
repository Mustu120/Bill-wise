import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MultiSelectTags from '@/components/MultiSelectTags';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutGrid,
  CheckSquare,
  BarChart3,
  Settings,
  User,
  Plus,
  Calendar as CalendarIcon,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertProjectSchema } from '@shared/schema';
import { z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { UserWithoutPassword } from '@shared/schema';
import ThemeToggle from '@/components/ThemeToggle';

type StatusFilter = 'All' | 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
type Project = {
  id: string;
  name: string;
  tags?: string[];
  manager: string;
  deadline: Date | string;
  priority: 'High' | 'Medium' | 'Low';
  budget: number;
  budgetSpent: number;
  description?: string | null;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
};

const formSchema = insertProjectSchema.extend({
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const COMMON_TAGS = [
  'Design',
  'Development',
  'Mobile',
  'Integration',
  'CRM',
  'Analytics',
  'Dashboard',
  'Cloud',
  'Infrastructure',
  'Backend',
  'Frontend',
  'Testing',
  'Security',
  'Performance',
];

const DUMMY_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform Redesign',
    manager: 'Priya Sharma',
    status: 'In Progress',
    progress: 65,
    budget: 80000,
    budgetSpent: 45000,
    deadline: '2025-12-15',
    priority: 'High',
    tags: ['Design', 'Development'],
    description: 'Complete redesign of the e-commerce platform with modern UI/UX',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    manager: 'Rahul Mehta',
    status: 'Planned',
    progress: 15,
    budget: 120000,
    budgetSpent: 12000,
    deadline: '2025-01-30',
    priority: 'Medium',
    tags: ['Mobile', 'Development'],
    description: 'Native mobile application for iOS and Android',
  },
  {
    id: '3',
    name: 'CRM System Integration',
    manager: 'Anjali Verma',
    status: 'In Progress',
    progress: 82,
    budget: 65000,
    budgetSpent: 58000,
    deadline: '2025-11-20',
    priority: 'High',
    tags: ['Integration', 'CRM'],
    description: 'Integration of new CRM system with existing infrastructure',
  },
  {
    id: '4',
    name: 'Data Analytics Dashboard',
    manager: 'Vikram Singh',
    status: 'Completed',
    progress: 100,
    budget: 35000,
    budgetSpent: 33000,
    deadline: '2025-10-05',
    priority: 'Medium',
    tags: ['Analytics', 'Dashboard'],
    description: 'Real-time analytics dashboard for business intelligence',
  },
  {
    id: '5',
    name: 'Cloud Migration Project',
    manager: 'Sneha Patel',
    status: 'On Hold',
    progress: 40,
    budget: 95000,
    budgetSpent: 28000,
    deadline: '2025-02-28',
    priority: 'Low',
    tags: ['Cloud', 'Infrastructure'],
    description: 'Migration of legacy systems to cloud infrastructure',
  },
];

const MANAGERS = [
  'Priya Sharma',
  'Rahul Mehta',
  'Anjali Verma',
  'Vikram Singh',
  'Sneha Patel',
  'Arjun Kumar',
  'Kavita Desai',
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('Projects');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: currentUser } = useQuery<{ user: UserWithoutPassword }>({
    queryKey: ['/api/auth/me'],
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery<{ projects: Project[] }>({
    queryKey: ['/api/projects'],
  });

  const projects = projectsData?.projects || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      manager: '',
      priority: 'Medium',
      budget: 0,
      status: 'Planned',
      tags: [],
      description: '',
      deadline: new Date(),
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/projects', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Project created',
        description: 'New project has been added successfully.',
      });
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormValues> }) => {
      const response = await apiRequest('PATCH', `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Project updated',
        description: 'Project has been updated successfully.',
      });
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/projects/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Project deleted',
        description: 'Project has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isFormModalOpen && editingProject) {
      // Editing mode - prefill form
      form.reset({
        name: editingProject.name,
        manager: editingProject.manager,
        priority: editingProject.priority,
        budget: editingProject.budget,
        status: editingProject.status,
        tags: editingProject.tags || [],
        description: editingProject.description || '',
        deadline: new Date(editingProject.deadline),
      });
      setSelectedTags(editingProject.tags || []);
    } else if (!isFormModalOpen) {
      // Reset to defaults when closing
      form.reset({
        name: '',
        manager: '',
        priority: 'Medium',
        budget: 0,
        status: 'Planned',
        tags: [],
        description: '',
        deadline: new Date(),
      });
      setSelectedTags([]);
      setEditingProject(null);
    }
  }, [isFormModalOpen, editingProject, form]);

  const filteredProjects = projects.filter((project) => {
    if (statusFilter === 'All') return true;
    return project.status === statusFilter;
  });

  const stats = {
    activeProjects: projects.filter((p) => p.status === 'In Progress').length,
    delayedTasks: projects.filter((p) => p.status === 'On Hold').length,
    hoursLogged: 1250,
    revenueEarned: 185000,
  };

  const handleSaveProject = (data: FormValues) => {
    const projectData = {
      ...data,
      tags: selectedTags,
    };

    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: projectData });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setIsFormModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProjectMutation.mutate(projectId);
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'Planned':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'Completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'On Hold':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
      default:
        return '';
    }
  };

  const sidebarItems = [
    { icon: LayoutGrid, label: 'Projects', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'My profile', path: '/profile' },
  ];

  const style = {
    '--sidebar-width': '16rem',
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent" data-testid="text-logo">
              FlowChain
            </h1>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        onClick={() => setActiveSidebarItem(item.label)}
                        isActive={activeSidebarItem === item.label}
                        data-testid={`button-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h2 className="text-2xl font-bold" data-testid="text-page-title">Projects</h2>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button
                  onClick={handleOpenAddModal}
                  className="gap-2"
                  data-testid="button-new-project"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b">
            <Card data-testid="card-stat-active-projects">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Active Projects</div>
                <div className="text-3xl font-bold">{stats.activeProjects}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-delayed-tasks">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Delayed Tasks</div>
                <div className="text-3xl font-bold">{stats.delayedTasks}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-hours-logged">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Hours Logged (All)</div>
                <div className="text-3xl font-bold">{stats.hoursLogged.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-revenue-earned">
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Revenue Earned</div>
                <div className="text-3xl font-bold">₹{stats.revenueEarned.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {(['All', 'Planned', 'In Progress', 'Completed', 'On Hold'] as StatusFilter[]).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                  size="sm"
                  data-testid={`button-filter-${status.toLowerCase().replace(' ', '-')}`}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover-elevate cursor-pointer relative group"
                  data-testid={`card-project-${project.id}`}
                >
                  <div onClick={() => handleCardClick(project)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <h3 className="font-semibold text-lg leading-tight" data-testid={`text-project-name-${project.id}`}>
                          {project.name}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`button-project-menu-${project.id}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(project);
                              }}
                              data-testid={`button-edit-${project.id}`}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className="text-destructive"
                              data-testid={`button-delete-${project.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={cn('text-xs', getStatusColor(project.status))} data-testid={`badge-status-${project.id}`}>
                          {project.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span data-testid={`text-manager-${project.id}`}>{project.manager}</span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span data-testid={`text-progress-${project.id}`}>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Budget</span>
                          <span className="font-medium" data-testid={`text-budget-${project.id}`}>
                            ₹{project.budgetSpent.toLocaleString()} / ₹{project.budget.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span data-testid={`text-deadline-${project.id}`}>
                            Due: {format(new Date(project.deadline), 'yyyy-MM-dd')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(project);
                          }}
                          data-testid={`button-view-details-${project.id}`}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`button-add-task-${project.id}`}
                        >
                          + Add Task
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-add-project">
          <DialogHeader>
            <DialogTitle data-testid="text-modal-title-add">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveProject)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter project name" data-testid="input-project-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <MultiSelectTags
                    value={selectedTags}
                    onChange={setSelectedTags}
                    placeholder="Add tags..."
                    suggestions={COMMON_TAGS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Manager</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-manager">
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MANAGERS.map((manager) => (
                          <SelectItem key={manager} value={manager}>
                            {manager}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            data-testid="input-deadline"
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                        data-testid="radio-priority"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="High" />
                          </FormControl>
                          <FormLabel className="font-normal">High</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Medium" />
                          </FormControl>
                          <FormLabel className="font-normal">Medium</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Low" />
                          </FormControl>
                          <FormLabel className="font-normal">Low</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (₹)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter budget"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-budget"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter project description"
                        rows={3}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormModalOpen(false)}
                  data-testid="button-cancel-add"
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-project">
                  {editingProject ? 'Update' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Project Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-md" data-testid="modal-project-details">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <DialogTitle className="text-xl" data-testid="text-modal-title-details">
                {selectedProject?.name}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsDetailsModalOpen(false)}
                data-testid="button-close-details"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                This section will later show full project details, tasks, and financial data.
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(selectedProject.status)} data-testid="text-detail-status">
                    {selectedProject.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Manager:</span>
                  <span className="font-medium" data-testid="text-detail-manager">
                    {selectedProject.manager}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <span className="font-medium" data-testid="text-detail-progress">
                    {selectedProject.progress}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Budget:</span>
                  <span className="font-medium" data-testid="text-detail-budget">
                    ₹{selectedProject.budgetSpent.toLocaleString()} / ₹
                    {selectedProject.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Date:</span>
                  <span className="font-medium" data-testid="text-detail-deadline">
                    {format(new Date(selectedProject.deadline), 'yyyy-MM-dd')}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => setIsDetailsModalOpen(false)}
                data-testid="button-close-modal"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
