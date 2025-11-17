export type FieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'select' 
  | 'multi-select' 
  | 'checkbox' 
  | 'date' 
  | 'file';

export interface FieldOption {
  label: string;
  value: string;
}

export interface AgentField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    regex?: string;
    min?: number;
    max?: number;
    options?: FieldOption[];
  };
  conditional_logic?: {
    field_id: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string;
  };
}

export interface AgentPersona {
  name: string;
  avatar_url?: string;
  tagline?: string;
  tone?: 'professional' | 'friendly' | 'casual' | 'formal';
  instructions?: string;
}

export interface AgentAppearance {
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  logo_url?: string;
}

export interface Agent {
  id: string;
  workspace_id: string;
  owner_id: string;
  name: string;
  slug: string;
  fields: AgentField[];
  persona: AgentPersona;
  appearance: AgentAppearance;
  knowledge_refs: string[];
  status: 'draft' | 'published' | 'archived';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentInput {
  name: string;
  slug?: string;
  fields: AgentField[];
  persona: AgentPersona;
  appearance?: AgentAppearance;
  knowledge_refs?: string[];
}

export interface UpdateAgentInput {
  name?: string;
  slug?: string;
  fields?: AgentField[];
  persona?: AgentPersona;
  appearance?: AgentAppearance;
  knowledge_refs?: string[];
  status?: 'draft' | 'published' | 'archived';
}
