import { z } from 'zod';
import { apiClient } from '../../../shared/services/apiClient';

export const platformSchema = z.object({
  platform: z.string(),
  username: z.string(),
});

export type Platform = z.infer<typeof platformSchema>;

export const platformListSchema = z.array(platformSchema);
const platformUpdateSchema = z.object({
  username: z.string(),
});

export const platformsApi = {
  listPlatforms: async (): Promise<Platform[]> => {
    const { data } = await apiClient.get('/platforms/');
    return platformListSchema.parse(data);
  },

  createPlatform: async (platform: string, username: string): Promise<Platform> => {
    const { data } = await apiClient.post('/platforms/', { platform, username });
    return platformSchema.parse(data);
  },

  updatePlatform: async (platform: string, username: string): Promise<{ username: string }> => {
    const { data } = await apiClient.patch(`/platforms/${platform}/`, { username });
    return platformUpdateSchema.parse(data);
  },

  deletePlatform: async (platform: string): Promise<void> => {
    await apiClient.delete(`/platforms/${platform}/`);
  },
};
