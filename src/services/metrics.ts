import { authFetch } from './auth';
import { API_BASE } from './config';

export interface UserMetrics {
  total_active_days: number;
  current_streak: number;
  longest_streak: number;
  total_activities: number;
  updated_at: string;
}

export interface GenerationMetric {
  id: string;
  created_at: string;
  status: 'success' | 'pending' | 'failed';
  total_active_days: number;
  current_streak: number;
  longest_streak: number;
  total_activities: number;
}

export interface MetricsResponse {
  user_metrics: UserMetrics;
  generation_metrics: GenerationMetric[];
}

let metricsPromise: Promise<MetricsResponse> | null = null;

export const fetchMetrics = async (): Promise<MetricsResponse> => {
  if (metricsPromise) {
    return metricsPromise;
  }

  metricsPromise = (async () => {
    try {
      const response = await authFetch(`${API_BASE}/metrics/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }
      return (await response.json()) as MetricsResponse;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    } finally {
      metricsPromise = null;
    }
  })();

  return metricsPromise;
};
