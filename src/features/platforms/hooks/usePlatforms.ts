import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformsApi, Platform } from '../services/platforms.api';

export const platformsKeys = {
  all: ['platforms'] as const,
};

export function usePlatforms() {
  return useQuery({
    queryKey: platformsKeys.all,
    queryFn: platformsApi.listPlatforms,
  });
}

export function useCreatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ platform, username }: { platform: string; username: string }) => 
      platformsApi.createPlatform(platform, username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformsKeys.all });
    },
  });
}

export function useDeletePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platform: string) => platformsApi.deletePlatform(platform),
    onMutate: async (deletedPlatformId) => {
      await queryClient.cancelQueries({ queryKey: platformsKeys.all });
      const previousPlatforms = queryClient.getQueryData<Platform[]>(platformsKeys.all);

      if (previousPlatforms) {
        queryClient.setQueryData<Platform[]>(
          platformsKeys.all,
          previousPlatforms.filter(p => p.platform !== deletedPlatformId)
        );
      }
      return { previousPlatforms };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.previousPlatforms) {
        queryClient.setQueryData(platformsKeys.all, context.previousPlatforms);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: platformsKeys.all });
    },
  });
}
