import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Download, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Zap,
  Database,
  MessageSquare,
  Plus,
  Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing";
import type { Invoice } from "@/types/billing";
import { toast } from "sonner";
import { PlanChangeModal } from "@/components/billing/PlanChangeModal";
import { PaymentMethodModal } from "@/components/billing/PaymentMethodModal";
import { InvoiceDetailsDialog } from "@/components/billing/InvoiceDetailsDialog";
import { UsageMetricsChart } from "@/components/billing/UsageMetricsChart";
import { format } from "date-fns";

export function BillingPage() {
  const [planChangeModalOpen, setPlanChangeModalOpen] = useState(false);
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  // Fetch subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: () => billingApi.getSubscription(),
  });

  // Fetch usage metrics
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: () => billingApi.getUsageMetrics(),
  });

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => billingApi.getInvoices(),
  });

  // Fetch payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["billing", "payment-methods"],
    queryFn: () => billingApi.getPaymentMethods(),
  });

  // Fetch plans
  const { data: plans } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => billingApi.getPlans(),
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => billingApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "subscription"] });
      toast.success("Subscription canceled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  // Resume subscription mutation
  const resumeSubscriptionMutation = useMutation({
    mutationFn: () => billingApi.resumeSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "subscription"] });
      toast.success("Subscription resumed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resume subscription");
    },
  });

  // Delete payment method mutation
  const deletePaymentMethodMutation = useMutation({
    mutationFn: (paymentMethodId: string) => billingApi.deletePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "payment-methods"] });
      toast.success("Payment method deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment method");
    },
  });

  // Set default payment method mutation
  const setDefaultPaymentMethodMutation = useMutation({
    mutationFn: (paymentMethodId: string) => billingApi.setDefaultPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "payment-methods"] });
      toast.success("Default payment method updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update default payment method");
    },
  });

  // Download invoice
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const blob = await billingApi.downloadInvoice(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      paid: "default",
      pending: "secondary",
      failed: "destructive",
      canceled: "secondary",
      past_due: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 75) return "text-orange-500";
    return "text-primary";
  };


  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing & Plans</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription, usage, and payment methods
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Current Subscription */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Subscription</CardTitle>
                    <CardDescription>
                      Your active plan and billing information
                    </CardDescription>
                  </div>
                  {subscription && (
                    <Button
                      onClick={() => setPlanChangeModalOpen(true)}
                      variant="outline"
                    >
                      {subscription.status === "active" ? "Change Plan" : "Upgrade Plan"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : subscription ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{subscription.plan.name}</h3>
                        <p className="text-muted-foreground">
                          ${subscription.plan.price}/{subscription.plan.interval}
                        </p>
                      </div>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Period</p>
                        <p className="font-medium">
                          {format(new Date(subscription.currentPeriodStart), "MMM d")} -{" "}
                          {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="flex items-center gap-2">
                          {subscription.cancelAtPeriodEnd ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                              <p className="font-medium text-orange-500">
                                Cancels on {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
                              </p>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-accent" />
                              <p className="font-medium">Active</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <Button
                        onClick={() => resumeSubscriptionMutation.mutate()}
                        variant="outline"
                        disabled={resumeSubscriptionMutation.isPending}
                      >
                        Resume Subscription
                      </Button>
                    )}
                    {!subscription.cancelAtPeriodEnd && subscription.status === "active" && (
                      <Button
                        onClick={() => cancelSubscriptionMutation.mutate()}
                        variant="outline"
                        disabled={cancelSubscriptionMutation.isPending}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No active subscription</p>
                )}
              </CardContent>
            </Card>

            {/* Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Usage This Period</CardTitle>
                <CardDescription>
                  Track your usage against plan limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {usageLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : usage ? (
                  <>
                    {/* Sessions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Sessions</span>
                        </div>
                        <span className={`text-sm font-semibold ${getUsageColor(usage.sessions.percentage)}`}>
                          {usage.sessions.used.toLocaleString()} / {usage.sessions.limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={usage.sessions.percentage} 
                        className="h-2"
                      />
                    </div>

                    {/* LLM Calls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">LLM Calls</span>
                        </div>
                        <span className={`text-sm font-semibold ${getUsageColor(usage.llmCalls.percentage)}`}>
                          {usage.llmCalls.used.toLocaleString()} / {usage.llmCalls.limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={usage.llmCalls.percentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Embedding Calls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Embedding Calls</span>
                        </div>
                        <span className={`text-sm font-semibold ${getUsageColor(usage.embeddingCalls.percentage)}`}>
                          {usage.embeddingCalls.used.toLocaleString()} / {usage.embeddingCalls.limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={usage.embeddingCalls.percentage} 
                        className="h-2"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No usage data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>
                  Detailed usage metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsageMetricsChart />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View and download your invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : invoices && invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Invoice #{invoice.invoiceNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(invoice.invoiceDate), "MMM d, yyyy")} • ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(invoice.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            View
                          </Button>
                          {invoice.pdfUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                    <p className="text-muted-foreground">
                      Your invoices will appear here once you have an active subscription
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your payment methods
                    </CardDescription>
                  </div>
                  <Button onClick={() => setPaymentMethodModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethodsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {method.cardType ? method.cardType.toUpperCase() : method.type.toUpperCase()}
                                {method.lastFour && ` •••• ${method.lastFour}`}
                              </h3>
                              {method.isDefault && (
                                <Badge variant="default" className="text-xs">Default</Badge>
                              )}
                            </div>
                            {method.expiryMonth && method.expiryYear && (
                              <p className="text-sm text-muted-foreground">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDefaultPaymentMethodMutation.mutate(method.id)}
                              disabled={setDefaultPaymentMethodMutation.isPending}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                            disabled={deletePaymentMethodMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
                    <p className="text-muted-foreground mb-4">
                      Add a payment method to get started
                    </p>
                    <Button onClick={() => setPaymentMethodModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {subscription && plans && (
          <PlanChangeModal
            open={planChangeModalOpen}
            onOpenChange={setPlanChangeModalOpen}
            currentSubscription={subscription}
            plans={plans}
          />
        )}

        <PaymentMethodModal
          open={paymentMethodModalOpen}
          onOpenChange={setPaymentMethodModalOpen}
        />

        {selectedInvoice && (
          <InvoiceDetailsDialog
            invoice={selectedInvoice}
            open={!!selectedInvoice}
            onOpenChange={(open) => !open && setSelectedInvoice(null)}
            onDownload={() => handleDownloadInvoice(selectedInvoice)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
