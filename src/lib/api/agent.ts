import { api } from "../api";
import type { Agent } from "@/types/agent";

export interface GetAgentBySlugParams {
  workspace: string;
  slug: string;
}

export const agentApi = {
  getBySlug: async (params: GetAgentBySlugParams): Promise<Agent> => {
    return api.get<Agent>(`/agents/${params.workspace}/${params.slug}`);
  },
  getById: async (id: string): Promise<Agent> => {
    return api.get<Agent>(`/agents/${id}`);
  },
};
