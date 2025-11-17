import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle2, TrendingUp, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionsSummaryWidgetsProps {
  totalSessions: number;
  completedSessions: number;
  conversionRate: number;
  trendingSources: Array<{ source: string; count: number }>;
  isLoading?: boolean;
}

export function SessionsSummaryWidgets({
  totalSessions,
  completedSessions,
  conversionRate,
  trendingSources,
  isLoading = false,
}: SessionsSummaryWidgetsProps) {
  const topSource = trendingSources[0]?.source || "N/A";

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Sessions
          </CardTitle>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All time sessions
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Sessions
          </CardTitle>
          <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedSessions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Successfully completed
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Conversion Rate
          </CardTitle>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Completion rate
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Trending Source
          </CardTitle>
          <div className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center">
            <Globe className="h-4 w-4 text-secondary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topSource}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {trendingSources[0]?.count || 0} sessions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
