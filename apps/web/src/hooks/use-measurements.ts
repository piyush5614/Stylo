import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalyzeMeasurementsPayload, UpdateBodyProfilePayload } from "@/types";

export const measurementQueryKeys = {
  profile: ["body_profile"] as const,
};

/** Hook to fetch active session body profile */
export function useBodyProfile() {
  return useQuery({
    queryKey: measurementQueryKeys.profile,
    queryFn: () => api.fetchProfile(),
    staleTime: 60_000,
  });
}

/** Hook to submit 4 captured poses and compute measurements */
export function useAnalyzeMeasurements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AnalyzeMeasurementsPayload) =>
      api.analyzeMeasurements(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(measurementQueryKeys.profile, data);
    },
  });
}

/** Hook to update manual measurement overrides */
export function useUpdateProfileOverrides() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBodyProfilePayload) =>
      api.updateProfileOverrides(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(measurementQueryKeys.profile, data);
    },
  });
}
