import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Folder, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { FilterBar } from "@/components/FilterBar";
import { BarChartCard, PieChartCard, DonutChartCard, LineChartCard, AreaChartCard } from "@/components/Charts";
import { AppLayout } from "@/components/AppLayout";

export default function AnalyticsPage() {
  const [filters, setFilters] = useState({
    project: "all",
    employee: "all",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: "all",
    billable: "all",
    groupBy: "project",
  });

  const { data: kpis } = useQuery({
    queryKey: ["/api/analytics/kpis", filters],
  });

  const { data: projectCosts } = useQuery({
    queryKey: ["/api/analytics/project-costs", filters],
  });

  const { data: resourceUtilization } = useQuery({
    queryKey: ["/api/analytics/resource-utilization", filters],
  });

  const { data: projectCompletion } = useQuery({
    queryKey: ["/api/analytics/completion", filters],
  });

  const { data: workloadTrend } = useQuery({
    queryKey: ["/api/analytics/workload-trend", filters],
  });

  const { data: revenueExpense } = useQuery({
    queryKey: ["/api/analytics/revenue-expense", filters],
  });

  const { data: taskStatus } = useQuery({
    queryKey: ["/api/analytics/task-status", filters],
  });

  const { data: filterOptions } = useQuery({
    queryKey: ["/api/analytics/filters"],
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppLayout>
      <div className="h-screen overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor project performance and key metrics</p>
        </div>

        <FilterBar
          projects={filterOptions?.projects || []}
          employees={filterOptions?.employees || []}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Projects"
            value={kpis?.totalProjects || 0}
            icon={Folder}
            testId="kpi-total-projects"
          />
          <KpiCard
            title="Tasks Completed"
            value={kpis?.tasksCompleted || 0}
            icon={CheckCircle}
            testId="kpi-tasks-completed"
          />
          <KpiCard
            title="Total Hours Logged"
            value={`${kpis?.totalHours || 0}h`}
            icon={Clock}
            testId="kpi-total-hours"
          />
          <KpiCard
            title="Billable vs Non-Billable"
            value={`${kpis?.billableHours || 0}h / ${kpis?.nonBillableHours || 0}h`}
            subtitle={`${kpis?.billablePercentage || 0}% Billable`}
            icon={TrendingUp}
            testId="kpi-billable-hours"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <BarChartCard
            title="Project Cost vs Revenue"
            data={projectCosts || []}
            dataKeys={[
              { key: "cost", color: "#ef4444", name: "Cost" },
              { key: "revenue", color: "#10b981", name: "Revenue" },
            ]}
            xAxisKey="name"
            testId="chart-project-costs"
          />
          <PieChartCard
            title="Resource Utilization"
            data={resourceUtilization || []}
            dataKey="value"
            nameKey="name"
            colors={["#a855f7", "#f97316"]}
            testId="chart-resource-utilization"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DonutChartCard
            title="Project Completion Progress"
            data={projectCompletion || []}
            dataKey="value"
            nameKey="name"
            testId="chart-project-completion"
          />
          <LineChartCard
            title="Monthly Workload Trend"
            data={workloadTrend || []}
            dataKeys={[
              { key: "hours", color: "#a855f7", name: "Hours Logged" },
            ]}
            xAxisKey="month"
            testId="chart-workload-trend"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AreaChartCard
            title="Revenue vs Expense Trend"
            data={revenueExpense || []}
            dataKeys={[
              { key: "revenue", color: "#10b981", name: "Revenue" },
              { key: "expense", color: "#ef4444", name: "Expense" },
            ]}
            xAxisKey="month"
            testId="chart-revenue-expense"
          />
          <PieChartCard
            title="Task Status Distribution"
            data={taskStatus || []}
            dataKey="value"
            nameKey="name"
            colors={["#10b981", "#f97316", "#a855f7", "#ef4444"]}
            testId="chart-task-status"
          />
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
