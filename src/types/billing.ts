export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  limits: PlanLimits;
  stripePriceId?: string;
  stripeProductId?: string;
}

export interface PlanFeature {
  id: string;
  name: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  sessions: number;
  llmCalls: number;
  embeddingCalls: number;
  knowledgeAttachments: number;
  agents: number;
  webhooks: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: Plan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageMetrics {
  userId: string;
  periodStart: string;
  periodEnd: string;
  sessions: {
    used: number;
    limit: number;
    percentage: number;
  };
  llmCalls: {
    used: number;
    limit: number;
    percentage: number;
  };
  embeddingCalls: {
    used: number;
    limit: number;
    percentage: number;
  };
  knowledgeAttachments: {
    used: number;
    limit: number;
    percentage: number;
  };
  agents: {
    used: number;
    limit: number;
    percentage: number;
  };
}

export interface UsageDataPoint {
  date: string;
  sessions: number;
  llmCalls: number;
  embeddingCalls: number;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'void';
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  pdfUrl?: string;
  lineItems: InvoiceLineItem[];
  stripeInvoiceId?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_account' | 'paypal';
  cardType?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'unionpay';
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
  stripePaymentMethodId?: string;
  createdAt: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
