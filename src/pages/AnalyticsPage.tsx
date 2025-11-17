import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
  Download,
  BarChart3,
} from "lucide-react";
import { useAnalyticsMetrics, useAgentPerformance, useSessionTimeSeries, useFunnelAnalysis, useTrafficSources } from "@/hooks/useAnalytics";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { ExportReportModal } from "@/components/analytics/ExportReportModal";
import type { AnalyticsFilters as AnalyticsFiltersType } from "@/types/analytics";

// Format time in seconds to human-readable format
function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

// Metric Card Component with Trend
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  description?: string;
  sparklineData?: number[];
}

function MetricCard({
  title,
  value,
  trend,
  icon,
  description,
  sparklineData,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="card-hover animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs mt-1">
            <TrendIcon
              className={`h-3 w-3 ${
                isPositive ? "text-accent" : "text-destructive"
              }`}
            />
            <span
              className={isPositive ? "text-accent" : "text-destructive"}
            >
              {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">from last period</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-2 h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData.map((val, idx) => ({ value: val, index: idx }))}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(var(--primary))"
                  fill="rgb(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFiltersType>({});
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Fetch analytics data
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics(filters);
  const { data: agentPerformance, isLoading: agentPerformanceLoading } =
    useAgentPerformance(filters);
  const { data: timeSeriesData, isLoading: timeSeriesLoading } =
    useSessionTimeSeries(filters);
  const { data: funnelData, isLoading: funnelLoading } =
    useFunnelAnalysis(filters);
  const { data: trafficSources, isLoading: trafficLoading } =
    useTrafficSources(filters);

  // Generate sparkline data from time series
  const sessionsSparkline = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.length === 0) return undefined;
    return timeSeriesData.map((d) => d.sessions);
  }, [timeSeriesData]);

  const completionSparkline = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.length === 0) return undefined;
    return timeSeriesData.map((d) =>
      d.sessions > 0 ? (d.completed / d.sessions) * 100 : 0
    );
  }, [timeSeriesData]);

  // Chart colors
  const chartColors = {
    primary: "rgb(var(--primary))",
    accent: "rgb(var(--accent))",
    secondary: "rgb(var(--secondary))",
    destructive: "rgb(var(--destructive))",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground mt-1">
              Track performance and optimize your agents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(true)}
              className="btn-hover"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {metricsLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </>
              ) : metrics ? (
                <>
                  <MetricCard
                    title="Total Sessions"
                    value={metrics.total_sessions.toLocaleString()}
                    trend={metrics.trends.sessions_change}
                    icon={<Users className="h-4 w-4" />}
                    sparklineData={sessionsSparkline}
                  />
                  <MetricCard
                    title="Completion Rate"
                    value={`${metrics.completion_rate.toFixed(1)}%`}
                    trend={metrics.trends.completion_rate_change}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    sparklineData={completionSparkline}
                  />
                  <MetricCard
                    title="Avg. Time"
                    value={formatTime(metrics.average_completion_time)}
                    trend={metrics.trends.avg_time_change}
                    icon={<Clock className="h-4 w-4" />}
                    description="Average completion time"
                  />
                  <MetricCard
                    title="Leads Generated"
                    value={metrics.leads_generated.toLocaleString()}
                    trend={metrics.trends.leads_change}
                    icon={<TrendingUp className="h-4 w-4" />}
                    description="Completed sessions"
                  />
                </>
              ) : (
                <div className="col-span-4 text-center py-8 text-muted-foreground">
                  No metrics data available
                </div>
              )}
            </div>

            {/* Charts and Tables */}
            <Tabs defaultValue="sessions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="sessions">Sessions Over Time</TabsTrigger>
                <TabsTrigger value="agents">Agent Performance</TabsTrigger>
                <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
                <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
              </TabsList>

              {/* Sessions Over Time */}
              <TabsContent value="sessions">
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions Over Time</CardTitle>
                    <CardDescription>
                      Track session volume and completion rates over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {timeSeriesLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : timeSeriesData && timeSeriesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timeSeriesData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgb(var(--border))"
                          />
                          <XAxis
                            dataKey="date"
                            stroke="rgb(var(--muted-foreground))"
                            tick={{ fill: "rgb(var(--muted-foreground))" }}
                          />
                          <YAxis
                            stroke="rgb(var(--muted-foreground))"
                            tick={{ fill: "rgb(var(--muted-foreground))" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgb(var(--card))",
                              border: "1px solid rgb(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="sessions"
                            stroke={chartColors.primary}
                            strokeWidth={2}
                            name="Total Sessions"
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            stroke={chartColors.accent}
                            strokeWidth={2}
                            name="Completed"
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="abandoned"
                            stroke={chartColors.destructive}
                            strokeWidth={2}
                            name="Abandoned"
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No session data available for the selected period
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Agent Performance */}
              <TabsContent value="agents">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Performance</CardTitle>
                    <CardDescription>
                      Compare performance across your agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {agentPerformanceLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : agentPerformance && agentPerformance.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={agentPerformance}
                          layout="vertical"
                          margin={{ left: 60 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgb(var(--border))"
                          />
                          <XAxis
                            type="number"
                            stroke="rgb(var(--muted-foreground))"
                            tick={{ fill: "rgb(var(--muted-foreground))" }}
                          />
                          <YAxis
                            type="category"
                            dataKey="agent_name"
                            stroke="rgb(var(--muted-foreground))"
                            tick={{ fill: "rgb(var(--muted-foreground))" }}
                            width={120}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgb(var(--card))",
                              border: "1px solid rgb(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="sessions_count"
                            fill={chartColors.primary}
                            name="Sessions"
                            radius={[0, 4, 4, 0]}
                          />
                          <Bar
                            dataKey="completed_count"
                            fill={chartColors.accent}
                            name="Completed"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No agent performance data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Funnel Analysis */}
              <TabsContent value="funnel">
                <Card>
                  <CardHeader>
                    <CardTitle>Funnel Analysis</CardTitle>
                    <CardDescription>
                      Track drop-off rates at each stage of the process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {funnelLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : funnelData && funnelData.steps.length > 0 ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {funnelData.total_started.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Started
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-accent">
                              {funnelData.overall_completion_rate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Completion Rate
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {formatTime(funnelData.average_total_time)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Avg. Time
                            </div>
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={funnelData.steps}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgb(var(--border))"
                            />
                            <XAxis
                              dataKey="step_name"
                              stroke="rgb(var(--muted-foreground))"
                              tick={{ fill: "rgb(var(--muted-foreground))" }}
                            />
                            <YAxis
                              stroke="rgb(var(--muted-foreground))"
                              tick={{ fill: "rgb(var(--muted-foreground))" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgb(var(--card))",
                                border: "1px solid rgb(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="sessions_count"
                              fill={chartColors.primary}
                              name="Sessions"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="drop_off_count"
                              fill={chartColors.destructive}
                              name="Drop-offs"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                          {funnelData.steps.map((step) => (
                            <div
                              key={step.step_order}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                  {step.step_order}
                                </div>
                                <div>
                                  <div className="font-medium">{step.step_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {step.sessions_count.toLocaleString()} sessions
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-destructive">
                                  {step.drop_off_rate.toFixed(1)}% drop-off
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatTime(step.average_time_at_step)} avg
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No funnel data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Traffic Sources */}
              <TabsContent value="traffic">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>
                      Where your visitors are coming from
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trafficLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : trafficSources && trafficSources.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Source</TableHead>
                              <TableHead>Medium</TableHead>
                              <TableHead>Campaign</TableHead>
                              <TableHead className="text-right">Sessions</TableHead>
                              <TableHead className="text-right">Completed</TableHead>
                              <TableHead className="text-right">Rate</TableHead>
                              <TableHead className="text-right">Avg. Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trafficSources.map((source) => (
                              <TableRow key={source.id}>
                                <TableCell className="font-medium">
                                  {source.source || "Direct"}
                                </TableCell>
                                <TableCell>{source.medium || "-"}</TableCell>
                                <TableCell>{source.campaign || "-"}</TableCell>
                                <TableCell className="text-right">
                                  {source.sessions_count.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  {source.completed_count.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant={
                                      source.completion_rate >= 70
                                        ? "default"
                                        : source.completion_rate >= 50
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {source.completion_rate.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatTime(source.average_time)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No traffic source data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Export Report Modal */}
      <ExportReportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        filters={filters}
      />
    </DashboardLayout>
  );
}
