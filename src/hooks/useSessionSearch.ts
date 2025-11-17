import { useQuery } from "@tanstack/react-query";
import { sessionApi } from "@/lib/api/session";
import type { SessionSearchParams, SessionSearchResponse } from "@/types/session";

export function useSessionSearch(params: SessionSearchParams) {
  return useQuery<SessionSearchResponse>({
    queryKey: ["sessions", "search", params],
    queryFn: () => sessionApi.search(params),
    enabled: true,
    staleTime: 1000 * 60, // 1 minute
  });
}
