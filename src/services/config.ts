/**
 * Central API configuration.
 * Set NEXT_PUBLIC_API_BASE_URL in your .env.local file to point at the deployed backend.
 * Falls back to localhost for local development.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
