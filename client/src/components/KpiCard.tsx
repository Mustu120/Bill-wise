import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  testId?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, testId }: KpiCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1" data-testid={`${testId}-subtitle`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
