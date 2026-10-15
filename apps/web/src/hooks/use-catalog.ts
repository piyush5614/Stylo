import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, setStoredSessionId } from "@/lib/api";
import { useAppStore } from "@/stores/app-store";
import type { CreateSessionPayload, GarmentFilterParams } from "@/types";

export const queryKeys = {
  garments: (params?: GarmentFilterParams) => ["garments", params] as const,
  garment: (slug: string) => ["garment", slug] as const,
  fabrics: ["fabrics"] as const,
  fabric: (slug: string) => ["fabric", slug] as const,
  session: ["session"] as const,
};

/** Hook to fetch active garments with optional filters and pagination */
export function useGarments(params?: GarmentFilterParams) {
  return useQuery({
    queryKey: queryKeys.garments(params),
    queryFn: () => api.fetchGarments(params),
  });
}

/** Hook to fetch single garment detail including colors, sizes, and fabric profile */
export function useGarment(slug: string) {
  return useQuery({
    queryKey: queryKeys.garment(slug),
    queryFn: () => api.fetchGarmentDetail(slug),
    enabled: Boolean(slug),
  });
}

/** Hook to list all fabrics */
export function useFabrics() {
  return useQuery({
    queryKey: queryKeys.fabrics,
    queryFn: () => api.fetchFabrics(),
  });
}

/** Hook to fetch single fabric detail */
export function useFabric(slug: string) {
  return useQuery({
    queryKey: queryKeys.fabric(slug),
    queryFn: () => api.fetchFabricDetail(slug),
    enabled: Boolean(slug),
  });
}

/** Hook to initialize anonymous session with explicit user consent */
export function useCreateSession() {
  const setSession = useAppStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => api.createSession(payload),
    onSuccess: (session) => {
      setStoredSessionId(session.id);
      setSession(session);
      queryClient.setQueryData(queryKeys.session, session);
    },
  });
}
