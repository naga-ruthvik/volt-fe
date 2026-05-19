/**
 * AnalyticsView — KPI cards + Heatmap.
 * Extracted from the original Dashboard page content.
 */

import React from 'react';
import { Heatmap } from '../Heatmap';
import { useMetrics } from '../../features/metrics/hooks/useMetrics';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#1a1a1a] ${className}`} />
);

export const AnalyticsView: React.FC = () => {
  const { data, isLoading: loading, error } = useMetrics();

  const metrics = data?.user_metrics;

  const kpiCards = [
    {
      label: 'KPI_01',
      title: 'Total Activities',
      value: metrics?.total_activities?.toLocaleString() ?? '—',
      suffix: null,
    },
    {
      label: 'KPI_02',
      title: 'Current Streak',
      value: metrics?.current_streak ?? '—',
      suffix: 'D',
    },
    {
      label: 'KPI_03',
      title: 'Longest Streak',
      value: metrics?.longest_streak ?? '—',
      suffix: 'D',
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-2">
        <h1 className="font-bold text-4xl md:text-5xl tracking-tighter uppercase text-white mb-2 md:mb-0">
          ANALYTICS_OVERVIEW
        </h1>
        <div className="tracking-[0.3em] text-[10px] text-zinc-400 uppercase">
          SYS_TIME: {new Date().toISOString().split('T')[1].slice(0, 8)} UTC
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="border border-red-500/40 bg-red-500/5 px-4 py-2 text-[10px] tracking-[0.2em] text-red-400 uppercase font-bold">
          ERR: {error.message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#343535] border border-[#343535]">
        {kpiCards.map((card, idx) => {
          const dotPositions = [
            ['bg-white', 'bg-[#343535]', 'bg-[#343535]'],
            ['bg-[#343535]', 'bg-white', 'bg-[#343535]'],
            ['bg-[#343535]', 'bg-[#343535]', 'bg-white'],
          ][idx];

          return (
            <div key={card.label} className="bg-black relative p-4 group">
              <div className="crosshair-tl" /><div className="crosshair-tr" />
              <div className="crosshair-bl" /><div className="crosshair-br" />
              <div className="flex items-center justify-between -mx-4 -mt-4 p-2 mb-4 border-b border-[#343535] bg-[#0a0a0a]">
                <span className="text-[10px] tracking-[0.3em] text-zinc-400 font-bold ml-2">{card.label}</span>
                <div className="flex gap-[2px] mr-2">
                  {dotPositions.map((cls, i) => (
                    <div key={i} className={`w-[4px] h-[4px] ${cls} ${cls === 'bg-white' ? 'group-hover:shadow-[0_0_8px_#ffffff]' : ''}`} />
                  ))}
                </div>
              </div>

              <div className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-bold">{card.title}</div>

              {loading ? (
                <Skeleton className="mt-3 h-16 w-32 rounded-none" />
              ) : (
                <div className="text-6xl md:text-8xl font-bold tracking-tighter text-white mt-2 flex items-baseline gap-2">
                  {card.value}
                  {card.suffix && (
                    <span className="text-2xl md:text-4xl text-white group-hover:text-shadow-glow transition-all">
                      {card.suffix}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Active Days sub-stat */}
      {!loading && metrics && (
        <div className="border border-[#2a2a2a] px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-bold">TOTAL_ACTIVE_DAYS</span>
          <span className="text-sm font-bold text-zinc-300 tabular-nums">{metrics.total_active_days}</span>
        </div>
      )}

      {/* Heatmap Section */}
      <div className="w-full">
        <Heatmap />
      </div>
    </>
  );
};
