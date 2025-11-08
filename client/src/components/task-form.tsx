import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import type { Task, InsertTask, UserWithoutPassword, Project, Timesheet } from "@shared/schema";
import { insertTaskSchema } from "@shared/schema";
import { format } from "date-fns";

interface TaskFormProps {
  task: Task | null;
  onClose: () => void;
}

interface TimesheetRow {
  id?: string;
  employeeId: string;
  timeLogged: number;
}

export function TaskForm({ task, onClose }: TaskFormProps) {
  const { data: currentUser } = useQuery<{ user: UserWithoutPassword }>({
    queryKey: ['/api/auth/me'],
  });
  const user = currentUser?.user;
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(task?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [timesheets, setTimesheets] = useState<TimesheetRow[]>([]);
  const [deletedTimesheetIds, setDeletedTimesheetIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("description");

  const { data: usersData } = useQuery<{ users: UserWithoutPassword[] }>({
    queryKey: ["/api/admin/users"],
  });

  const { data: projectsData } = useQuery<{ projects: Project[] }>({
    queryKey: ["/api/projects"],
  });

  const { data: timesheetsData } = useQuery<{ timesheets: Timesheet[] }>({
    queryKey: ["/api/tasks", task?.id, "timesheets"],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${task?.id}/timesheets`, { 
        credentials: "include" 
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch timesheets: ${res.statusText}`);
      }
      return await res.json();
    },
    enabled: !!task?.id,
  });

  useEffect(() => {
    if (timesheetsData?.timesheets) {
      setTimesheets(timesheetsData.timesheets.map(t => ({
        id: t.id,
        employeeId: t.employeeId,
        timeLogged: t.timeLogged,
      })));
    }
  }, [timesheetsData]);

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      taskName: task?.taskName || "",
      assigneeId: task?.assigneeId || undefined,
      projectId: task?.projectId || undefined,
      tags: task?.tags || [],
      deadline: task?.deadline ? new Date(task.deadline) : undefined,
      description: task?.description || "",
      imageUrl: task?.imageUrl || undefined,
      lastModifiedBy: user?.id,
      totalHours: task?.totalHours || 0,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const payload = {
        ...data,
        imageUrl: uploadedImageUrl || data.imageUrl,
      };

      if (task?.id) {
        const response = await apiRequest("PUT", `/api/tasks/${task.id}`, payload);
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/tasks", payload);
        return await response.json();
      }
    },
    onSuccess: async (data) => {
      const savedTask = data.task;
      
      for (const deletedId of deletedTimesheetIds) {
        await apiRequest("DELETE", `/api/timesheets/${deletedId}`, undefined);
      }
      
      for (const ts of timesheets) {
        const timesheetData = {
          taskId: savedTask.id,
          employeeId: ts.employeeId,
          timeLogged: ts.timeLogged,
        };

        if (ts.id) {
          await apiRequest("PUT", `/api/timesheets/${ts.id}`, timesheetData);
        } else {
          await apiRequest("POST", "/api/timesheets", timesheetData);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"], refetchType: "all" });
      
      toast({
        title: task ? "Task updated" : "Task created",
        description: task ? "Task has been updated successfully." : "Task has been created successfully.",
      });
      
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save task",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedImageUrl(data.url);
      
      toast({
        title: "File uploaded",
        description: "File has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTimesheet = () => {
    setTimesheets([...timesheets, { employeeId: "", timeLogged: 0 }]);
  };

  const handleRemoveTimesheet = (index: number) => {
    const timesheetToRemove = timesheets[index];
    if (timesheetToRemove.id) {
      setDeletedTimesheetIds([...deletedTimesheetIds, timesheetToRemove.id]);
    }
    setTimesheets(timesheets.filter((_, i) => i !== index));
  };

  const handleTimesheetChange = (index: number, field: keyof TimesheetRow, value: any) => {
    const updated = [...timesheets];
    updated[index] = { ...updated[index], [field]: value };
    setTimesheets(updated);
  };

  const onSubmit = (data: InsertTask) => {
    saveMutation.mutate(data);
  };

  const users = usersData?.users || [];
  const projects = projectsData?.projects || [];
  const totalHours = timesheets.reduce((sum, ts) => sum + (ts.timeLogged || 0), 0);

  const lastModifiedUser = task?.lastModifiedBy
    ? users.find(u => u.id === task.lastModifiedBy)
    : null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="heading-task-form">
              {task ? "Edit Task" : "Create New Task"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Select Project &gt; {task ? "Edit Task" : "New Task"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-discard"
            >
              Discard
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={saveMutation.isPending}
              data-testid="button-save-task"
            >
              {saveMutation.isPending ? "Saving..." : "Save Task"}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              data-testid="button-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                placeholder="Enter task name"
                {...form.register("taskName")}
                data-testid="input-task-name"
              />
              {form.formState.errors.taskName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.taskName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee *</Label>
              <Select
                value={form.watch("assigneeId") || ""}
                onValueChange={(value) => form.setValue("assigneeId", value)}
              >
                <SelectTrigger id="assignee" data-testid="select-assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={form.watch("projectId") || ""}
                onValueChange={(value) => form.setValue("projectId", value)}
              >
                <SelectTrigger id="project" data-testid="select-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                {...form.register("deadline")}
                data-testid="input-deadline"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Select tags"
                value={form.watch("tags")?.join(", ") || ""}
                onChange={(e) => {
                  const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                  form.setValue("tags", tags);
                }}
                data-testid="input-tags"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image Upload</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                  onClick={() => document.getElementById("file-upload")?.click()}
                  data-testid="button-upload-image"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : uploadedImageUrl ? "Change Image" : "Upload Image"}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </div>
              {uploadedImageUrl && (
                <p className="text-sm text-muted-foreground truncate">
                  {uploadedImageUrl}
                </p>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="description" data-testid="tab-description">
                Description
              </TabsTrigger>
              <TabsTrigger value="timesheets" data-testid="tab-timesheets">
                Timesheets
              </TabsTrigger>
              <TabsTrigger value="info" data-testid="tab-task-info">
                Task Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Textarea
                placeholder="Enter task description..."
                className="min-h-[200px]"
                {...form.register("description")}
                data-testid="textarea-description"
              />
            </TabsContent>

            <TabsContent value="timesheets" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Billable Hours</h3>
                <Button
                  type="button"
                  onClick={handleAddTimesheet}
                  data-testid="button-add-timesheet"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Timesheet
                </Button>
              </div>

              {timesheets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground" data-testid="text-no-timesheets">
                      No timesheets added yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {timesheets.map((timesheet, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-end">
                          <div className="space-y-2">
                            <Label>Employee</Label>
                            <Select
                              value={timesheet.employeeId}
                              onValueChange={(value) => handleTimesheetChange(index, "employeeId", value)}
                            >
                              <SelectTrigger data-testid={`select-timesheet-employee-${index}`}>
                                <SelectValue placeholder="Select employee" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Time Logged (hrs)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={timesheet.timeLogged}
                              onChange={(e) => handleTimesheetChange(index, "timeLogged", parseFloat(e.target.value) || 0)}
                              data-testid={`input-timesheet-hours-${index}`}
                            />
                          </div>

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveTimesheet(index)}
                            data-testid={`button-remove-timesheet-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6 space-y-2">
                    <p className="text-sm text-muted-foreground">Last Changed By</p>
                    <p className="text-lg font-semibold" data-testid="text-last-changed-by">
                      {lastModifiedUser?.name || "N/A"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-2">
                    <p className="text-sm text-muted-foreground">Last Changed On</p>
                    <p className="text-lg font-semibold" data-testid="text-last-changed-on">
                      {task?.lastModifiedOn 
                        ? format(new Date(task.lastModifiedOn), "MMM dd, yyyy HH:mm")
                        : "N/A"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6 space-y-2">
                  <p className="text-sm text-muted-foreground">Total Working Hours</p>
                  <p className="text-2xl font-bold" data-testid="text-total-hours">
                    {totalHours} hrs
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Auto-calculated from timesheets
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
}
