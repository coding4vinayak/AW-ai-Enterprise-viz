import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Database, MessageSquare, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Chart } from '@shared/types';

type UsageStats = {
  api_calls: number;
  ai_tokens: number;
  storage: number;
};

type CustomerUsageData = {
  datasets: number;
  dashboards: number;
  charts: number;
  users: number;
};

export default function UsageDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Fetch usage stats
  const { data: usageStats, isLoading: statsLoading, error: statsError } = useQuery<UsageStats>({
    queryKey: ['/api/usage/stats', period],
    enabled: !!user && user.role !== 'viewer',
  });

  // Fetch customer usage data
  const { data: customerData, isLoading: customerLoading, error: customerError } = useQuery<CustomerUsageData>({
    queryKey: ['/api/usage/customer'],
    enabled: !!user && user.role !== 'viewer',
  });

  const isLoading = statsLoading || customerLoading;
  const hasError = statsError || customerError;

  if (user?.role === "viewer") {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only admins can view usage statistics.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Usage Dashboard</h1>
            <p className="text-muted-foreground">Loading usage metrics...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>
              Failed to load usage statistics. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const safeUsageStats = usageStats || { api_calls: 0, ai_tokens: 0, storage: 0 };
  const safeCustomerData = customerData || { datasets: 0, dashboards: 0, charts: 0, users: 0 };

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-usage-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Usage Dashboard</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">Monitor your platform usage and metrics</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)} data-testid="select-period">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last Day</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-api-calls">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-api-calls">{safeUsageStats.api_calls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total requests in period</p>
          </CardContent>
        </Card>

        <Card data-testid="card-ai-tokens">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Tokens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-ai-tokens">{safeUsageStats.ai_tokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tokens consumed</p>
          </CardContent>
        </Card>

        <Card data-testid="card-datasets">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-datasets">{safeCustomerData.datasets}</div>
            <p className="text-xs text-muted-foreground">Total datasets created</p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-users">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-users">{safeCustomerData.users}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="resources" className="space-y-4" data-testid="tabs-usage">
        <TabsList data-testid="tablist-usage">
          <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Overview of platform resources</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Datasets', value: safeCustomerData.datasets },
                  { name: 'Dashboards', value: safeCustomerData.dashboards },
                  { name: 'Charts', value: safeCustomerData.charts },
                  { name: 'Users', value: safeCustomerData.users },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Metrics</CardTitle>
              <CardDescription>API calls and AI token usage over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: 'API Calls', value: safeUsageStats.api_calls },
                  { name: 'AI Tokens', value: Math.round(safeUsageStats.ai_tokens / 1000) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}