import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metricsApi } from '../services/metrics.api';

export const metricsKeys = {
  all: ['metrics'] as const,
};

export function useMetrics() {
  return useQuery({
    queryKey: metricsKeys.all,
    queryFn: metricsApi.fetchMetrics,
  });
}

export function useTriggerGenerate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: metricsApi.triggerGenerate,
    onSuccess: () => {
      // Refresh the metrics list when a new generation is triggered successfully
      queryClient.invalidateQueries({ queryKey: metricsKeys.all });
    },
  });
}
