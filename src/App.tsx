import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { isAuthenticated, tryAutoAuth } from './services/auth';

/**
 * Smart landing route — auto-redirects authenticated users to dashboard.
 * On first load, tries to restore session via refresh cookie.
 */
function SmartLanding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      // Quick check: if we have a valid token, redirect immediately
      if (isAuthenticated()) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // Slower check: try refreshing via HttpOnly cookie
      const restored = await tryAutoAuth();
      if (cancelled) return;

      if (restored) {
        navigate('/dashboard', { replace: true });
      } else {
        setChecking(false); // No session — show landing page
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [navigate]);

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

/** Protects routes that require authentication */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SmartLanding />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
