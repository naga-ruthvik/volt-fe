import { useState, useEffect, useCallback } from 'react';
import {
  listPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  triggerGenerate,
  type Platform,
} from '../services/platforms';

interface UsePlatformsResult {
  platforms: Platform[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  addPlatform: (platform: string, username: string) => Promise<void>;
  editPlatform: (platform: string, username: string) => Promise<void>;
  removePlatform: (platform: string) => Promise<void>;
  generate: () => Promise<void>;
  refetch: () => void;
}

export const usePlatforms = (): UsePlatformsResult => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listPlatforms()
      .then(data => { if (!cancelled) setPlatforms(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [trigger]);

  const refetch = useCallback(() => setTrigger(t => t + 1), []);

  const addPlatform = useCallback(async (platform: string, username: string) => {
    setSubmitting(true);
    try {
      const created = await createPlatform(platform, username);
      setPlatforms(prev => [...prev, created]);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const editPlatform = useCallback(async (platform: string, username: string) => {
    setSubmitting(true);
    try {
      await updatePlatform(platform, username);
      setPlatforms(prev => prev.map(p => p.platform === platform ? { ...p, username } : p));
    } finally {
      setSubmitting(false);
    }
  }, []);

  const removePlatform = useCallback(async (platform: string) => {
    setSubmitting(true);
    try {
      await deletePlatform(platform);
      setPlatforms(prev => prev.filter(p => p.platform !== platform));
    } finally {
      setSubmitting(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setSubmitting(true);
    try {
      await triggerGenerate();
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { platforms, loading, error, submitting, addPlatform, editPlatform, removePlatform, generate, refetch };
};
