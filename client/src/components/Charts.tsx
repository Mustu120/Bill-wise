import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted))",
  green: "#10b981",
  red: "#ef4444",
  purple: "#a855f7",
  orange: "#f97316",
};

interface BarChartCardProps {
  title: string;
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
  testId?: string;
}

export function BarChartCard({ title, data, dataKeys, xAxisKey, testId }: BarChartCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((dk) => (
              <Bar key={dk.key} dataKey={dk.key} fill={dk.color} name={dk.name} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface PieChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  testId?: string;
}

export function PieChartCard({ title, data, dataKey, nameKey, colors = [COLORS.purple, COLORS.orange], testId }: PieChartCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface DonutChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  nameKey: string;
  testId?: string;
}

export function DonutChartCard({ title, data, dataKey, nameKey, testId }: DonutChartCardProps) {
  const CHART_COLORS = [COLORS.primary, COLORS.green, COLORS.orange, COLORS.red, COLORS.purple];
  
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface LineChartCardProps {
  title: string;
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
  testId?: string;
}

export function LineChartCard({ title, data, dataKeys, xAxisKey, testId }: LineChartCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((dk) => (
              <Line key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color} name={dk.name} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface AreaChartCardProps {
  title: string;
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
  testId?: string;
}

export function AreaChartCard({ title, data, dataKeys, xAxisKey, testId }: AreaChartCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((dk) => (
              <Area key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color} fill={dk.color} fillOpacity={0.6} name={dk.name} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
