import { z } from 'zod';
import { apiClient } from '../../../shared/services/apiClient';

export const userMetricsSchema = z.object({
  total_active_days: z.number(),
  current_streak: z.number(),
  longest_streak: z.number(),
  total_activities: z.number(),
  updated_at: z.string(),
});

export const generationMetricSchema = z.preprocess(raw => {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const record = raw as Record<string, unknown>;
  const totalActivities =
    record.total_activities ??
    record.gen_total_activities ??
    record.total_activity_count ??
    record.activities_count ??
    record.activity_count;

  const totalActiveDays =
    record.total_active_days ??
    record.gen_active_days;

  const longestStreak =
    record.longest_streak ??
    record.gen_longest_streak;

  return {
    ...record,
    total_activities: totalActivities,
    total_active_days: totalActiveDays,
    longest_streak: longestStreak,
  };
},
z.object({
  id: z.string().or(z.number()).transform(v => String(v)),
  created_at: z.string(),
  status: z
    .string()
    .transform(v => v.trim().toLowerCase())
    .pipe(z.enum(['completed', 'pending', 'failed']).catch('pending')),
  total_active_days: z.number().optional().default(0),
  current_streak: z.number().optional().default(0),
  longest_streak: z.number().optional().default(0),
  total_activities: z.number().optional().default(0),
}));

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
