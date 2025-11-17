import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardFooterProps {
  currentPlan?: string;
  usage?: {
    sessions: number;
    sessionsLimit: number;
    agents: number;
    agentsLimit: number;
  };
  billingPeriod?: string;
  isLoading?: boolean;
}

export function DashboardFooter({
  currentPlan = "Free",
  usage,
  billingPeriod = "This month",
  isLoading = false,
}: DashboardFooterProps) {
  const sessionsUsage = usage
    ? Math.round((usage.sessions / usage.sessionsLimit) * 100)
    : 0;
  const agentsUsage = usage
    ? Math.round((usage.agents / usage.agentsLimit) * 100)
    : 0;

  const isNearLimit = sessionsUsage > 80 || agentsUsage > 80;

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Usage & Billing</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{currentPlan}</span>
              </div>
              {usage && (
                <>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Sessions:</span>
                    <span className="font-medium">
                      {usage.sessions.toLocaleString()} / {usage.sessionsLimit.toLocaleString()}
                    </span>
                    <div className="flex-1 max-w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          sessionsUsage > 80
                            ? "bg-destructive"
                            : sessionsUsage > 60
                            ? "bg-orange-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(sessionsUsage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Agents:</span>
                    <span className="font-medium">
                      {usage.agents} / {usage.agentsLimit}
                    </span>
                    <div className="flex-1 max-w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          agentsUsage > 80
                            ? "bg-destructive"
                            : agentsUsage > 60
                            ? "bg-orange-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(agentsUsage, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
              <p className="text-xs text-muted-foreground">{billingPeriod}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isNearLimit && (
              <div className="flex items-center gap-2 text-sm text-orange-600 mr-2">
                <AlertCircle className="h-4 w-4" />
                <span>Near limit</span>
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/billing">
                <TrendingUp className="h-4 w-4 mr-2" />
                Manage Billing
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
