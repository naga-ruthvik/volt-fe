/**
 * GenerationsView — Map generation request history table.
 * Uses live data from the /metrics/ API.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { useMetrics, useTriggerGenerate } from '../../features/metrics/hooks/useMetrics';
import type { GenerationMetric } from '../../features/metrics/services/metrics.api';

const STATUS_STYLES = {
  success: {
    dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    bar: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] group-hover:shadow-[0_0_12px_rgba(52,211,153,0.8)]',
    label: 'SUCCESS',
  },
  failed: {
    dot: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]',
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    bar: 'bg-red-500/60 group-hover:bg-red-500/80',
    label: 'FAILED',
  },
  pending: {
    dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    bar: 'bg-amber-400/40 group-hover:bg-amber-400/60',
    label: 'PENDING',
  },
} as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} · ${time}`;
}

const SkeletonRow: React.FC<{ idx: number }> = ({ idx }) => (
  <div
    className="grid grid-cols-[3rem_auto_6rem_6rem] items-center px-5 py-4 border-b border-[#2a2a2a] last:border-b-0"
    style={{ animationDelay: `${idx * 70}ms` }}
  >
    <div className="h-4 w-6 bg-[#1a1a1a] animate-pulse mx-auto rounded-none" />
    <div className="h-4 w-48 bg-[#1a1a1a] animate-pulse rounded-none" />
    <div className="h-5 w-16 bg-[#1a1a1a] animate-pulse mx-auto rounded-none" />
    <div className="h-4 w-10 bg-[#1a1a1a] animate-pulse ml-auto rounded-none" />
  </div>
);

const GenerationRow: React.FC<{ gen: GenerationMetric; index: number }> = ({ gen, index }) => {
  const statusKey = gen.status in STATUS_STYLES ? gen.status : 'pending';
  const style = STATUS_STYLES[statusKey as keyof typeof STATUS_STYLES];

  return (
    <motion.div
      key={gen.id}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="relative grid grid-cols-[3rem_auto_6rem_6rem] items-center px-5 py-4 border-b border-[#2a2a2a] last:border-b-0 hover:bg-white/[0.03] transition-all duration-300 group cursor-default"
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300 ${style.bar}`} />

      {/* Serial number */}
      <span className="text-sm font-bold text-zinc-500 tabular-nums text-center group-hover:text-zinc-300 transition-colors">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Created at */}
      <span className="text-[13px] font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">
        {formatDate(gen.created_at)}
      </span>

      {/* Status pill */}
      <div className="flex justify-center">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 ${style.bg}`}>
          <div className={`w-1.5 h-1.5 ${style.dot}`} />
          <span className={`text-[9px] font-bold tracking-[0.15em] uppercase ${style.text}`}>
            {style.label}
          </span>
        </div>
      </div>

      {/* Total activities */}
      <div className="text-right">
        {gen.total_activities > 0 ? (
          <span className="text-sm font-bold text-white tabular-nums">{gen.total_activities.toLocaleString()}</span>
        ) : (
          <span className="text-[10px] font-mono text-zinc-600">&mdash;</span>
        )}
      </div>
    </motion.div>
  );
};

export const GenerationsView: React.FC = () => {
  const { data, isLoading: loading, error, refetch } = useMetrics();
  const { mutateAsync: generate, isPending: generating } = useTriggerGenerate();
  const [genStatus, setGenStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [genError, setGenError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenStatus('idle');
    setGenError(null);
    try {
      await generate();
      setGenStatus('ok');
      refetch(); // refresh generation list
      setTimeout(() => setGenStatus('idle'), 3000);
    } catch (err: any) {
      setGenError(err.message);
      setGenStatus('err');
    }
  };

  const generations = data?.generation_metrics ?? [];
  const successCount = generations.filter(g => g.status === 'success').length;
  const failedCount = generations.filter(g => g.status === 'failed').length;
  const pendingCount = generations.filter(g => g.status === 'pending').length;

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6">
        <div>
          <h1 className="font-bold text-4xl md:text-5xl tracking-tighter uppercase text-white mb-1">GENERATIONS</h1>
          <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-bold">
            {loading
              ? 'LOADING...'
              : `${generations.length} TOTAL · ${successCount} SUCCESS · ${failedCount} FAILED · ${pendingCount} PENDING`}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <div className="tracking-[0.3em] text-[10px] text-zinc-400 uppercase">
            SYS_TIME: {new Date().toISOString().split('T')[1].slice(0, 8)} UTC
          </div>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="border border-red-500/40 bg-red-500/5 px-4 py-2 mb-4 text-[10px] tracking-[0.2em] text-red-400 uppercase font-bold">
          ERR: {error.message}
        </div>
      )}

      {/* Table */}
      <div className="border border-[#2a2a2a]">
        {/* Column headers */}
        <div className="grid grid-cols-[3rem_auto_6rem_6rem] items-center px-5 py-3 bg-[#0a0a0a] border-b border-[#2a2a2a]">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 text-center">#</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">CREATED_AT</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 text-center">STATUS</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 text-right">ACTIVITIES</span>
        </div>

        {/* Rows */}
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} idx={i} />)
          : generations.length === 0
            ? (
              <div className="px-5 py-10 text-center text-[10px] tracking-[0.3em] text-zinc-600 uppercase font-bold">
                NO_GENERATIONS_FOUND
              </div>
            )
            : generations.map((gen, i) => (
              <GenerationRow key={gen.id} gen={gen} index={i} />
            ))}
      </div>

      {/* Generate error */}
      {genStatus === 'err' && genError && (
        <div className="border border-red-500/40 bg-red-500/5 px-4 py-2 text-[10px] tracking-[0.2em] text-red-400 uppercase font-bold">
          ERR: {genError}
        </div>
      )}

      {/* Generate new */}
      <button
        onClick={handleGenerate}
        disabled={generating || loading}
        className="w-full bg-black text-white border border-white p-5 text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all font-bold flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> GENERATING.....</>
        ) : genStatus === 'ok' ? (
          <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> GENERATION_QUEUED</>
        ) : (
          <><Zap className="w-4 h-4 group-hover:scale-125 transition-transform" /> GENERATE_NEW_MAP</>
        )}
      </button>
    </>
  );
};
