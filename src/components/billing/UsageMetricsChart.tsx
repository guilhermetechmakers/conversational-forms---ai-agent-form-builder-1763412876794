import { useQuery } from "@tanstack/react-query";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { billingApi } from "@/lib/api/billing";
import { subDays, format } from "date-fns";

export function UsageMetricsChart() {
  const endDate = new Date();
  const startDate = subDays(endDate, 30);

  const { data: usageHistory, isLoading } = useQuery({
    queryKey: ["billing", "usage", "history", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => billingApi.getUsageHistory(startDate.toISOString(), endDate.toISOString()),
  });

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!usageHistory || usageHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        No usage data available for this period
      </div>
    );
  }

  const chartData = usageHistory.map((point) => ({
    date: format(new Date(point.date), "MMM d"),
    sessions: point.sessions,
    llmCalls: point.llmCalls,
    embeddingCalls: point.embeddingCalls,
  }));

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(37, 99, 235)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgb(37, 99, 235)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLLMCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEmbeddingCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(245, 158, 66)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgb(245, 158, 66)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="rgb(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            stroke="rgb(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="rgb(37, 99, 235)"
            fillOpacity={1}
            fill="url(#colorSessions)"
            name="Sessions"
          />
          <Area
            type="monotone"
            dataKey="llmCalls"
            stroke="rgb(16, 185, 129)"
            fillOpacity={1}
            fill="url(#colorLLMCalls)"
            name="LLM Calls"
          />
          <Area
            type="monotone"
            dataKey="embeddingCalls"
            stroke="rgb(245, 158, 66)"
            fillOpacity={1}
            fill="url(#colorEmbeddingCalls)"
            name="Embedding Calls"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
