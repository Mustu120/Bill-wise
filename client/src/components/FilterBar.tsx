import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  projects: { id: string; name: string }[];
  employees: { id: string; name: string }[];
  filters: {
    project: string;
    employee: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    status: string;
    billable: string;
    groupBy: string;
  };
  onFilterChange: (key: string, value: any) => void;
}

export function FilterBar({ projects, employees, filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={filters.project} onValueChange={(v) => onFilterChange('project', v)}>
          <SelectTrigger className="w-[180px]" data-testid="filter-project">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.employee} onValueChange={(v) => onFilterChange('employee', v)}>
          <SelectTrigger className="w-[180px]" data-testid="filter-employee">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !filters.startDate && "text-muted-foreground"
              )}
              data-testid="filter-start-date"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate ? format(filters.startDate, "dd-MM-yyyy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => onFilterChange('startDate', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !filters.endDate && "text-muted-foreground"
              )}
              data-testid="filter-end-date"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.endDate ? format(filters.endDate, "dd-MM-yyyy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => onFilterChange('endDate', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={filters.status} onValueChange={(v) => onFilterChange('status', v)}>
          <SelectTrigger className="w-[180px]" data-testid="filter-status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Planned">Planned</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.billable} onValueChange={(v) => onFilterChange('billable', v)}>
          <SelectTrigger className="w-[180px]" data-testid="filter-billable">
            <SelectValue placeholder="All Hours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hours</SelectItem>
            <SelectItem value="true">Billable</SelectItem>
            <SelectItem value="false">Non-Billable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Group By:</span>
        <Select value={filters.groupBy} onValueChange={(v) => onFilterChange('groupBy', v)}>
          <SelectTrigger className="w-[180px]" data-testid="filter-group-by">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="billable">Billable Type</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
