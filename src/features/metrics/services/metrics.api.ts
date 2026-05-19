import { z } from 'zod';
import { apiClient } from '../../../shared/services/apiClient';

export const userMetricsSchema = z.object({
  total_active_days: z.number(),
  current_streak: z.number(),
  longest_streak: z.number(),
  total_activities: z.number(),
  updated_at: z.string(),
});

export const generationMetricSchema = z.object({
  id: z.string().or(z.number()).transform(v => String(v)),
  created_at: z.string(),
  status: z.enum(['success', 'pending', 'failed', 'SUCCESS', 'PENDING', 'FAILED']).transform(v => v.toLowerCase() as 'success' | 'pending' | 'failed'),
  total_active_days: z.number().optional().default(0),
  current_streak: z.number().optional().default(0),
  longest_streak: z.number().optional().default(0),
  total_activities: z.number().optional().default(0),
});

export const metricsResponseSchema = z.object({
  user_metrics: userMetricsSchema,
  generation_metrics: z.array(generationMetricSchema),
});

export type UserMetrics = z.infer<typeof userMetricsSchema>;
export type GenerationMetric = z.infer<typeof generationMetricSchema>;
export type MetricsResponse = z.infer<typeof metricsResponseSchema>;

export const metricsApi = {
  fetchMetrics: async (): Promise<MetricsResponse> => {
    const { data } = await apiClient.get('/metrics/');
    return metricsResponseSchema.parse(data);
  },

  triggerGenerate: async (): Promise<void> => {
    await apiClient.post('/generate/');
  },
};
