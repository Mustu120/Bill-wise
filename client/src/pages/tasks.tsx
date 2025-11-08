import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, User, Tag } from "lucide-react";
import { TaskForm } from "@/components/task-form";
import { AppLayout } from "@/components/AppLayout";
import type { Task, UserWithoutPassword } from "@shared/schema";
import { format } from "date-fns";

export default function TasksPage() {
  const { data: currentUser } = useQuery<{ user: UserWithoutPassword }>({
    queryKey: ['/api/auth/me'],
  });
  const user = currentUser?.user;
  const [viewMode, setViewMode] = useState<"my" | "all">("my");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasksData, isLoading } = useQuery<{ tasks: Task[] }>({
    queryKey: ["/api/tasks", viewMode === "my" && user ? user.id : "all"],
    queryFn: async () => {
      const url = viewMode === "my" && user 
        ? `/api/tasks?assignedTo=${user.id}`
        : "/api/tasks";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.statusText}`);
      }
      return await res.json();
    },
    enabled: !!user,
  });

  const tasks = tasksData?.tasks || [];
  const filteredTasks = tasks.filter((task) =>
    task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.tags && task.tags.some((tag) => tag?.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  if (isFormOpen) {
    return (
      <AppLayout>
        <TaskForm
          task={selectedTask}
          onClose={handleCloseForm}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen overflow-auto bg-background">
        <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-tasks">Tasks</h1>
            <p className="text-muted-foreground">Manage and track all your tasks</p>
          </div>
          <Button onClick={handleCreateTask} data-testid="button-create-task">
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "my" ? "default" : "outline"}
              onClick={() => setViewMode("my")}
              data-testid="button-my-tasks"
            >
              My Tasks
            </Button>
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              onClick={() => setViewMode("all")}
              data-testid="button-all-tasks"
            >
              All Tasks
            </Button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-tasks"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold" data-testid="text-no-tasks">No tasks found</h3>
              <p className="text-muted-foreground">
                {viewMode === "my"
                  ? "You don't have any tasks assigned yet"
                  : "No tasks have been created yet"}
              </p>
            </div>
            <Button onClick={handleCreateTask} data-testid="button-create-first-task">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="hover-elevate cursor-pointer"
                onClick={() => handleEditTask(task)}
                data-testid={`card-task-${task.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg" data-testid={`text-task-name-${task.id}`}>
                    {task.taskName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{task.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {task.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(task.deadline), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {task.totalHours !== null && task.totalHours !== undefined && (
                      <div className="flex items-center gap-1">
                        <span>{task.totalHours} hrs</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
