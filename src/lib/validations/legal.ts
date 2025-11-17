import { z } from 'zod';

export const legalRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  inquiryType: z.enum(['privacy', 'terms', 'cookies', 'data_request', 'other'], {
    required_error: 'Please select an inquiry type',
  }),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

export type LegalRequestFormData = z.infer<typeof legalRequestSchema>;
