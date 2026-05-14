import { authFetch } from './auth';
import { API_BASE } from './config';

export interface Platform {
  platform: string;
  username: string;
}

// ── List ──────────────────────────────────────────────────────────────────────
export const listPlatforms = async (): Promise<Platform[]> => {
  const res = await authFetch(`${API_BASE}/platforms/`);
  if (!res.ok) throw new Error(`Failed to list platforms: ${res.status}`);
  return res.json();
};

// ── Create ────────────────────────────────────────────────────────────────────
export const createPlatform = async (platform: string, username: string): Promise<Platform> => {
  const res = await authFetch(`${API_BASE}/platforms/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to create platform: ${res.status}`);
  }
  return res.json();
};

// ── Update ────────────────────────────────────────────────────────────────────
export const updatePlatform = async (platform: string, username: string): Promise<Platform> => {
  const res = await authFetch(`${API_BASE}/platforms/${platform}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to update platform: ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : { platform, username };
};

// ── Delete ────────────────────────────────────────────────────────────────────
export const deletePlatform = async (platform: string): Promise<void> => {
  const res = await authFetch(`${API_BASE}/platforms/${platform}/`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete platform: ${res.status}`);
};

// ── Generate ──────────────────────────────────────────────────────────────────
export const triggerGenerate = async (): Promise<unknown> => {
  const res = await authFetch(`${API_BASE}/generate/`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to trigger generate: ${res.status}`);
  }
  // 204 No Content or similar — may have no body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};
