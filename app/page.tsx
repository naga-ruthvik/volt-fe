"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Landing from '../src/screens/Landing';
import { isAuthenticated, tryAutoAuth } from '../src/services/auth';

/**
 * Smart landing route — auto-redirects authenticated users to dashboard.
 * On first load, tries to restore session via refresh cookie.
 */
export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      // Quick check: if we have a valid token, redirect immediately
      if (isAuthenticated()) {
        router.replace('/dashboard');
        return;
      }

      // Slower check: try refreshing via HttpOnly cookie
      const restored = await tryAutoAuth();
      if (cancelled) return;

      if (restored) {
        router.replace('/dashboard');
      } else {
        setChecking(false); // No session — show landing page
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  // Brief loading state while checking auth — keeps the screen clean
  if (checking) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white/60 animate-pulse" />
      </div>
    );
  }

  return <Landing />;
}
