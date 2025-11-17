import { z } from "zod";

export const fieldOptionSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
});

export const agentFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Field name is required"),
  type: z.enum([
    "text",
    "email",
    "phone",
    "number",
    "select",
    "multi-select",
    "checkbox",
    "date",
    "file",
  ]),
  label: z.string().min(1, "Field label is required"),
  placeholder: z.string().optional(),
  required: z.boolean(),
  validation: z
    .object({
      regex: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      options: z.array(fieldOptionSchema).optional(),
    })
    .optional(),
  conditional_logic: z
    .object({
      field_id: z.string(),
      operator: z.enum(["equals", "not_equals", "contains"]),
      value: z.string(),
    })
    .optional(),
});

export const agentPersonaSchema = z.object({
  name: z.string().min(1, "Persona name is required"),
  avatar_url: z.string().url().optional().or(z.literal("")),
  tagline: z.string().optional(),
  tone: z.enum(["professional", "friendly", "casual", "formal"]).optional(),
  instructions: z.string().optional(),
  greeting_template: z.string().optional(),
  fallback_responses: z.array(z.string()).optional(),
});

export const agentAppearanceSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  font_family: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  header_text: z.string().optional(),
  cta_text: z.string().optional(),
});

export const createAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  fields: z.array(agentFieldSchema).min(1, "At least one field is required"),
  persona: agentPersonaSchema,
  appearance: agentAppearanceSchema.optional(),
  knowledge_refs: z.array(z.string()).optional(),
});

export const updateAgentSchema = createAgentSchema.partial();

export type CreateAgentFormData = z.infer<typeof createAgentSchema>;
export type UpdateAgentFormData = z.infer<typeof updateAgentSchema>;
export type AgentFieldFormData = z.infer<typeof agentFieldSchema>;
export type AgentPersonaFormData = z.infer<typeof agentPersonaSchema>;
export type AgentAppearanceFormData = z.infer<typeof agentAppearanceSchema>;
