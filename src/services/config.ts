/**
 * Central API configuration.
 * Set VITE_API_URL in your .env file to point at the deployed backend.
 * Falls back to localhost for local development.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
