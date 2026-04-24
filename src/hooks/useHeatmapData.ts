import { useState, useEffect } from 'react';
import { fetchHeatmapData } from '../services/heatmap';
import type { HeatmapData } from '../types/heatmap';

export const useHeatmapData = () => {
  const [data, setData] = useState<HeatmapData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchHeatmapData();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load heatmap data'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading, error };
};
