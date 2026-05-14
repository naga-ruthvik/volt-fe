import { useState, useEffect } from 'react';
import { fetchMetrics, type MetricsResponse } from '../services/metrics';

interface UseMetricsResult {
  data: MetricsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMetrics = (): UseMetricsResult => {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchMetrics();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [trigger]);

  const refetch = () => setTrigger(t => t + 1);

  return { data, loading, error, refetch };
};
