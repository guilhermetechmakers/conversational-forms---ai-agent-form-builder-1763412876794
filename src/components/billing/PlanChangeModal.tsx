import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing";
import type { Subscription, Plan } from "@/types/billing";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PlanChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSubscription: Subscription;
  plans: Plan[];
}

export function PlanChangeModal({
  open,
  onOpenChange,
  currentSubscription,
  plans,
}: PlanChangeModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateSubscriptionMutation = useMutation({
    mutationFn: (planId: string) => billingApi.updateSubscription(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "subscription"] });
      queryClient.invalidateQueries({ queryKey: ["billing", "usage"] });
      toast.success("Plan updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update plan");
    },
  });

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentSubscription.planId) {
      toast.info("This is your current plan");
      return;
    }

    setSelectedPlanId(planId);
    
    // For upgrades, redirect to Stripe checkout
    const selectedPlan = plans.find((p) => p.id === planId);
    const currentPlan = currentSubscription.plan;
    
    if (selectedPlan && currentPlan && selectedPlan.price > currentPlan.price) {
      try {
        const { url } = await billingApi.createCheckoutSession(planId);
        window.location.href = url;
      } catch (error) {
        toast.error("Failed to create checkout session");
      }
    } else {
      // For downgrades, update directly
      updateSubscriptionMutation.mutate(planId);
    }
  };

  const isCurrentPlan = (planId: string) => planId === currentSubscription.planId;
  const isUpgrade = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan && currentSubscription.plan && plan.price > currentSubscription.plan.price;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Plan</DialogTitle>
          <DialogDescription>
            Choose a plan that best fits your needs. You can upgrade or downgrade at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
                isCurrentPlan(plan.id) && "ring-2 ring-primary",
                selectedPlanId === plan.id && "ring-2 ring-primary"
              )}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {isCurrentPlan(plan.id) && (
                <div className="absolute top-4 right-4">
                  <Badge variant="default">Current</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent" />
                    <span>{plan.limits.sessions.toLocaleString()} sessions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent" />
                    <span>{plan.limits.llmCalls.toLocaleString()} LLM calls</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent" />
                    <span>{plan.limits.embeddingCalls.toLocaleString()} embedding calls</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent" />
                    <span>{plan.limits.agents} agents</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent" />
                    <span>{plan.limits.knowledgeAttachments} knowledge attachments</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrentPlan(plan.id) ? "outline" : "default"}
                  disabled={isCurrentPlan(plan.id) || updateSubscriptionMutation.isPending}
                >
                  {isCurrentPlan(plan.id) ? (
                    "Current Plan"
                  ) : updateSubscriptionMutation.isPending && selectedPlanId === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isUpgrade(plan.id) ? (
                    "Upgrade"
                  ) : (
                    "Downgrade"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
