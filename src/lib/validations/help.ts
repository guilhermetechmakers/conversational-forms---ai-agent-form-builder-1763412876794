import { z } from 'zod';

export const supportTicketSchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export const feedbackSchema = z.object({
  doc_id: z.string().optional(),
  tutorial_id: z.string().optional(),
  rating: z.enum(['helpful', 'not_helpful']),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

export type SupportTicketFormData = z.infer<typeof supportTicketSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
