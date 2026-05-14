/**
 * Sidebar — Volt Dashboard navigation panel.
 * Brutalist terminal-style sidebar with active page highlighting and logout.
 */

import React from 'react';
import {
  LayoutDashboard,
  Activity,
  UserCircle,
  Zap,
  Settings,
  Power,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout, getStoredUser } from '../../services/auth';

export type DashboardPage = 'dashboard' | 'analytics' | 'profiles' | 'generations' | 'settings';

interface SidebarProps {
  activePage: DashboardPage;
  onPageChange: (page: DashboardPage) => void;
}

const NAV_ITEMS: { id: DashboardPage; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'analytics', label: 'ANALYTICS', icon: Activity },
  { id: 'profiles', label: 'PROFILES', icon: UserCircle },
  { id: 'generations', label: 'GENERATIONS', icon: Zap },
  { id: 'settings', label: 'SETTINGS', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r border-[#343535] bg-black fixed left-0 top-0 z-40">
      {/* User panel */}
      <div className="p-4 border-b border-[#343535] flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-accent-gray border border-white/10 flex items-center justify-center">
          <UserCircle className="w-7 h-7 text-white/40" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white tracking-[0.3em] font-bold text-[12px]">VOLT_OS</span>
          <span className="text-outline tracking-widest text-[10px] font-bold truncate">
            {user?.username ? `@${user.username.toUpperCase()}` : '[USR_AUTH]'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              id={`sidebar-${item.id}`}
              className={`p-4 flex items-center gap-4 border-b border-[#343535] transition-all duration-75 text-left ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="tracking-[0.3em] uppercase text-[10px] font-bold">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Logout + Scan */}
        <div className="mt-auto px-4 py-4 space-y-3">
          <button className="w-full bg-black text-white border border-white p-4 text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all font-bold">
            EXECUTE_SCAN
          </button>
          <button
            onClick={handleLogout}
            id="sidebar-logout"
            className="w-full flex items-center justify-center gap-3 bg-black text-zinc-500 border border-[#343535] p-3 text-[10px] tracking-[0.3em] uppercase hover:border-red-400/50 hover:text-red-400 transition-all font-bold"
          >
            <Power className="w-4 h-4" />
            DISCONNECT
          </button>
        </div>
      </nav>
    </aside>
  );
};
