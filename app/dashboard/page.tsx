"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard as DashboardComponent } from '../../src/screens/Dashboard';
import { isAuthenticated } from '../../src/services/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white/60 animate-pulse" />
      </div>
    );
  }

  return <DashboardComponent />;
}
