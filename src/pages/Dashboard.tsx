import React, { useState } from 'react';
import { Bell, Sliders, Power } from 'lucide-react';
import { Sidebar, type DashboardPage } from '../components/dashboard/Sidebar';
import { AnalyticsView } from '../components/dashboard/AnalyticsView';
import { ProfilesView } from '../components/dashboard/ProfilesView';
import { GenerationsView } from '../components/dashboard/GenerationsView';

export const Dashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<DashboardPage>('analytics');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
      case 'analytics':
        return <AnalyticsView />;
      case 'profiles':
        return <ProfilesView />;
      case 'generations':
        return <GenerationsView />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-64 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">
            SETTINGS_MODULE // UNDER_CONSTRUCTION
          </div>
        );
      default:
        return <AnalyticsView />;
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex overflow-hidden font-mono">
      {/* TopAppBar for Mobile */}
      <nav className="md:hidden flex justify-between items-center px-4 h-12 border-b border-[#343535] bg-black fixed top-0 w-full z-50">
        <div className="text-white font-bold tracking-widest text-[16px]">VOLT_CORE_V1</div>
        <div className="flex gap-2">
          <Bell className="w-5 h-5 text-zinc-400" />
          <Sliders className="w-5 h-5 text-zinc-400" />
          <Power className="w-5 h-5 text-zinc-400" />
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-12 md:mt-0 p-6 overflow-y-auto relative z-10 w-full">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};
