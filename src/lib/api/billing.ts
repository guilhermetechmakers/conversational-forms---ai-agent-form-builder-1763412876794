import { api } from "../api";
import type {
  Plan,
  Subscription,
  UsageMetrics,
  UsageDataPoint,
  Invoice,
  PaymentMethod,
  BillingAddress,
} from "@/types/billing";

export const billingApi = {
  // Plans
  getPlans: async (): Promise<Plan[]> => {
    return api.get<Plan[]>("/billing/plans");
  },

  getPlan: async (planId: string): Promise<Plan> => {
    return api.get<Plan>(`/billing/plans/${planId}`);
  },

  // Subscription
  getSubscription: async (): Promise<Subscription> => {
    return api.get<Subscription>("/billing/subscription");
  },

  updateSubscription: async (planId: string): Promise<Subscription> => {
    return api.post<Subscription>("/billing/subscription", { planId });
  },

  cancelSubscription: async (): Promise<Subscription> => {
    return api.post<Subscription>("/billing/subscription/cancel", {});
  },

  resumeSubscription: async (): Promise<Subscription> => {
    return api.post<Subscription>("/billing/subscription/resume", {});
  },

  // Usage
  getUsageMetrics: async (): Promise<UsageMetrics> => {
    return api.get<UsageMetrics>("/billing/usage");
  },

  getUsageHistory: async (startDate: string, endDate: string): Promise<UsageDataPoint[]> => {
    return api.get<UsageDataPoint[]>(
      `/billing/usage/history?startDate=${startDate}&endDate=${endDate}`
    );
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    return api.get<Invoice[]>("/billing/invoices");
  },

  getInvoice: async (invoiceId: string): Promise<Invoice> => {
    return api.get<Invoice>(`/billing/invoices/${invoiceId}`);
  },

  downloadInvoice: async (invoiceId: string): Promise<Blob> => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/billing/invoices/${invoiceId}/download`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    return response.blob();
  },

  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    return api.get<PaymentMethod[]>("/billing/payment-methods");
  },

  addPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    return api.post<PaymentMethod>("/billing/payment-methods", { paymentMethodId });
  },

  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await api.post(`/billing/payment-methods/${paymentMethodId}/set-default`, {});
  },

  deletePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await api.delete(`/billing/payment-methods/${paymentMethodId}`);
  },

  // Billing Address
  getBillingAddress: async (): Promise<BillingAddress | null> => {
    return api.get<BillingAddress | null>("/billing/address");
  },

  updateBillingAddress: async (address: BillingAddress): Promise<BillingAddress> => {
    return api.put<BillingAddress>("/billing/address", address);
  },

  // Stripe Checkout
  createCheckoutSession: async (planId: string): Promise<{ url: string }> => {
    return api.post<{ url: string }>("/billing/checkout", { planId });
  },
};
