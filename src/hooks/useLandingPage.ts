import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface TrackCTAClickParams {
  ctaId: string;
  ctaText: string;
  destinationUrl: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  icon?: string;
}

interface Demo {
  id: string;
  title: string;
  demoUrl: string;
  description: string;
}

interface PricingTier {
  id: string;
  tierName: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

// Track CTA clicks for analytics
export function useTrackCTAClick() {
  return useMutation({
    mutationFn: async (params: TrackCTAClickParams) => {
      return api.post("/analytics/track-cta", params);
    },
    onError: (error) => {
      // Silently fail - analytics shouldn't block user experience
      console.error("Failed to track CTA click:", error);
    },
  });
}

// Fetch feature highlights
export function useFeatures() {
  return useQuery({
    queryKey: ["landing", "features"],
    queryFn: async (): Promise<Feature[]> => {
      try {
        return await api.get<Feature[]>("/landing/features");
      } catch (error) {
        // Return default features if API fails
        return getDefaultFeatures();
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    initialData: getDefaultFeatures(),
  });
}

// Fetch demos
export function useDemos() {
  return useQuery({
    queryKey: ["landing", "demos"],
    queryFn: async (): Promise<Demo[]> => {
      try {
        return await api.get<Demo[]>("/landing/demos");
      } catch (error) {
        // Return default demos if API fails
        return getDefaultDemos();
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    initialData: getDefaultDemos(),
  });
}

// Fetch pricing tiers
export function usePricingTiers() {
  return useQuery({
    queryKey: ["landing", "pricing-tiers"],
    queryFn: async (): Promise<PricingTier[]> => {
      try {
        return await api.get<PricingTier[]>("/landing/pricing-tiers");
      } catch (error) {
        // Return default pricing if API fails
        return getDefaultPricingTiers();
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    initialData: getDefaultPricingTiers(),
  });
}

// Default features (fallback)
function getDefaultFeatures(): Feature[] {
  return [
    {
      id: "1",
      title: "AI-Powered Conversations",
      description: "Natural language processing guides users through form completion with intelligent validation and contextual understanding.",
      icon: "Zap",
    },
    {
      id: "2",
      title: "Customizable Personas",
      description: "Define your agent's personality, tone, and appearance to match your brand and create authentic interactions.",
      icon: "MessageSquare",
    },
    {
      id: "3",
      title: "Knowledge Attachments",
      description: "Upload documents and knowledge bases that your agent can reference to provide accurate, contextual responses.",
      icon: "FileText",
    },
    {
      id: "4",
      title: "Webhook Integrations",
      description: "Connect to your CRM, marketing tools, and databases with flexible webhook configurations and field mapping.",
      icon: "Webhook",
    },
    {
      id: "5",
      title: "Secure & Compliant",
      description: "Enterprise-grade security with GDPR compliance, encryption, and secure data handling for peace of mind.",
      icon: "Shield",
    },
    {
      id: "6",
      title: "Analytics & Insights",
      description: "Track completion rates, analyze drop-offs, and optimize your forms with detailed analytics and reports.",
      icon: "BarChart3",
    },
  ];
}

// Default demos (fallback)
function getDefaultDemos(): Demo[] {
  return [
    {
      id: "1",
      title: "Lead Qualification Agent",
      description: "See how our AI agent qualifies leads through natural conversation",
      demoUrl: "/a/demo/lead-qualification",
    },
    {
      id: "2",
      title: "Customer Feedback Collector",
      description: "Experience conversational feedback collection in action",
      demoUrl: "/a/demo/customer-feedback",
    },
    {
      id: "3",
      title: "Event Registration",
      description: "Watch how conversational forms make registration effortless",
      demoUrl: "/a/demo/event-registration",
    },
  ];
}

// Default pricing tiers (fallback)
function getDefaultPricingTiers(): PricingTier[] {
  return [
    {
      id: "1",
      tierName: "Starter",
      price: "$0",
      features: [
        "100 sessions/month",
        "3 agents",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      id: "2",
      tierName: "Professional",
      price: "$29",
      features: [
        "1,000 sessions/month",
        "Unlimited agents",
        "Advanced analytics",
        "Webhook integrations",
        "Priority support",
      ],
      highlighted: true,
    },
    {
      id: "3",
      tierName: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited sessions",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "On-premise options",
      ],
    },
  ];
}
