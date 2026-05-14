import type { HeatmapData } from '../types/heatmap';
import { authFetch } from './auth';
import { API_BASE } from './config';

interface ApiActivity {
  id: number;
  platform: string;
  activity_date: string;
  activity_count: number;
  metadata: any;
}

let fetchPromise: Promise<HeatmapData> | null = null;

export const fetchHeatmapData = async (): Promise<HeatmapData> => {
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await authFetch(`${API_BASE}/activities/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }
      
      const rawData: ApiActivity[] = await response.json();
      const data: HeatmapData = {};

      for (const activity of rawData) {
        const { activity_date, platform, activity_count } = activity;
        
        if (!data[activity_date]) {
          data[activity_date] = {
            date: activity_date,
            total: 0,
            sources: {
              github: 0,
              leetcode: 0,
              codeforces: 0
            }
          };
        }
        
        data[activity_date].sources[platform] = (data[activity_date].sources[platform] || 0) + activity_count;
        data[activity_date].total += activity_count;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      return {};
    } finally {
      fetchPromise = null; // Clear cache so future separate refreshes will fetch new data
    }
  })();

  return fetchPromise;
};
