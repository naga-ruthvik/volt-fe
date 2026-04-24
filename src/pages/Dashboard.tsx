import React from 'react';
import { 
  Bell, 
  Sliders, 
  Power, 
  LayoutDashboard, 
  Activity, 
  Network, 
  Terminal, 
  Settings 
} from 'lucide-react';
import { Heatmap } from '../components/Heatmap';

export const Dashboard: React.FC = () => {
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

      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 border-r border-[#343535] bg-black fixed left-0 top-0 z-40">
        <div className="p-4 border-b border-[#343535] flex items-center gap-4">
          <img 
            alt="User System Avatar" 
            className="w-12 h-12 grayscale" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1-810jVZTKQeyQkvrQwqDg71Z-OxebuEXQiPigmEXie_1JOfV9Kpjmu7SLid9iA4Vq2v2Fzscqennk8vRxEvNhldjnPPrM6Zeh9mXjDaJHVRQGyTVKbU6kApQA6VcNwpy6ict9CWwiaEeyvH1qA7WDvcbVxNkpMWGiRcQ6vGqGFlFX0MdtXjwF5dm86I9IXdemB6KVzlSw5rwMTQ0LNm106LTcs2zqHYx0U-o0AEgajO2og9b-Iqv_CcGxGW8oEx3XlH17chE4mE"
          />
          <div className="flex flex-col">
            <span className="text-white tracking-[0.3em] font-bold text-[12px]">VOLT_OS</span>
            <span className="text-outline tracking-widest text-[10px] font-bold">[USR_01_AUTH]</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col">
          <a className="text-zinc-500 p-4 flex items-center gap-4 border-b border-[#343535] hover:text-white transition-all duration-75" href="#">
            <LayoutDashboard className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase text-[10px] font-bold">DASHBOARD</span>
          </a>
          <a className="bg-white text-black p-4 flex items-center gap-4 border-b border-[#343535]" href="#">
            <Activity className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase text-[10px] font-bold">ANALYTICS</span>
          </a>
          <a className="text-zinc-500 p-4 flex items-center gap-4 border-b border-[#343535] hover:text-white transition-all duration-75" href="#">
            <Network className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase text-[10px] font-bold">CONNECTIONS</span>
          </a>
          <a className="text-zinc-500 p-4 flex items-center gap-4 border-b border-[#343535] hover:text-white transition-all duration-75" href="#">
            <Terminal className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase text-[10px] font-bold">SYSTEM_LOGS</span>
          </a>
          <a className="text-zinc-500 p-4 flex items-center gap-4 border-b border-[#343535] hover:text-white transition-all duration-75" href="#">
            <Settings className="w-5 h-5" />
            <span className="tracking-[0.3em] uppercase text-[10px] font-bold">SETTINGS</span>
          </a>
          <div className="mt-auto px-4 py-4">
            <button className="w-full bg-black text-white border border-white p-4 text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all hover-bracket font-bold">
              EXECUTE_SCAN
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-12 md:mt-0 p-6 overflow-y-auto relative z-10 w-full">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-2">
            <h1 className="font-bold text-4xl md:text-5xl tracking-tighter uppercase text-white mb-2 md:mb-0">
              ANALYTICS_OVERVIEW
            </h1>
            <div className="tracking-[0.3em] text-[10px] text-zinc-400 uppercase">
              SYS_TIME: {new Date().toISOString().split('T')[1].slice(0,8)} UTC
            </div>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#343535] border border-[#343535]">
            
            {/* Card 1 */}
            <div className="bg-black relative p-4 group">
              <div className="crosshair-tl"></div><div className="crosshair-tr"></div><div className="crosshair-bl"></div><div className="crosshair-br"></div>
              <div className="flex items-center justify-between -mx-4 -mt-4 p-2 mb-4 border-b border-[#343535] bg-[#0a0a0a]">
                <span className="text-[10px] tracking-[0.3em] text-zinc-400 font-bold ml-2">KPI_01</span>
                <div className="flex gap-[2px] mr-2">
                  <div className="w-[4px] h-[4px] bg-white group-hover:shadow-[0_0_8px_#ffffff]"></div>
                  <div className="w-[4px] h-[4px] bg-[#343535]"></div>
                  <div className="w-[4px] h-[4px] bg-[#343535]"></div>
                </div>
              </div>
              <div className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-bold">Total Activities</div>
              <div className="text-6xl md:text-8xl font-bold tracking-tighter text-white mt-2">1,204</div>
            </div>

            {/* Card 2 */}
            <div className="bg-black relative p-4 group">
              <div className="crosshair-tl"></div><div className="crosshair-tr"></div><div className="crosshair-bl"></div><div className="crosshair-br"></div>
              <div className="flex items-center justify-between -mx-4 -mt-4 p-2 mb-4 border-b border-[#343535] bg-[#0a0a0a]">
                <span className="text-[10px] tracking-[0.3em] text-zinc-400 font-bold ml-2">KPI_02</span>
                <div className="flex gap-[2px] mr-2">
                  <div className="w-[4px] h-[4px] bg-[#343535]"></div>
                  <div className="w-[4px] h-[4px] bg-white group-hover:shadow-[0_0_8px_#ffffff]"></div>
                  <div className="w-[4px] h-[4px] bg-[#343535]"></div>
                </div>
              </div>
              <div className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-bold">Current Streak</div>
              <div className="text-6xl md:text-8xl font-bold tracking-tighter text-white mt-2 flex items-baseline gap-2">
                14<span className="text-2xl md:text-4xl text-white group-hover:text-shadow-glow transition-all">D</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-black relative p-4 group">
              <div className="crosshair-tl"></div><div className="crosshair-tr"></div><div className="crosshair-bl"></div><div className="crosshair-br"></div>
              <div className="flex items-center justify-between -mx-4 -mt-4 p-2 mb-4 border-b border-[#343535] bg-[#0a0a0a]">
                <span className="text-[10px] tracking-[0.3em] text-zinc-400 font-bold ml-2">KPI_03</span>
                <div className="flex gap-[2px] mr-2">
                  <div className="w-[4px] h-[4px] bg-[#343535]"></div>
                  <div className="w-[4px] h-[4px] bg-[#343535]"></div>
                  <div className="w-[4px] h-[4px] bg-white group-hover:shadow-[0_0_8px_#ffffff]"></div>
                </div>
              </div>
              <div className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-bold">Longest Streak</div>
              <div className="text-6xl md:text-8xl font-bold tracking-tighter text-white mt-2 flex items-baseline gap-2">
                82<span className="text-2xl md:text-4xl text-white group-hover:text-shadow-glow transition-all">D</span>
              </div>
            </div>

          </div>

          {/* Heatmap Section */}
          <div className="w-full">
            <Heatmap />
          </div>
          
        </div>
      </main>
    </div>
  );
};
