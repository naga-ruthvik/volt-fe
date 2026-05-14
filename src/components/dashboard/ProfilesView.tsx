/**
 * ProfilesView — Linked platform profiles.
 * Data sourced from GET /platforms/ (create/delete via POST/DELETE).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Github, Code, Trophy, Braces, Award, Cpu, Edit2,
  Plus, ChevronRight, Trash2, RefreshCw, Loader2,
} from 'lucide-react';
import { usePlatforms } from '../../hooks/usePlatforms';

// ── Platform metadata ─────────────────────────────────────────────────────────
// Mirrors Django's Platform.TextChoices exactly.

const PLATFORM_META: Record<string, { icon: React.FC<{ className?: string }>; label: string }> = {
  codeforces: { icon: Trophy, label: 'CODEFORCES' },
  codechef:   { icon: Braces, label: 'CODECHEF' },
  leetcode:   { icon: Code,   label: 'LEETCODE' },
  hackerrank: { icon: Award,  label: 'HACKERRANK' },
  github:     { icon: Github, label: 'GITHUB' },
};

const ALL_SUPPORTED = Object.keys(PLATFORM_META);

function getMeta(platform: string) {
  const key = platform.toLowerCase();
  return PLATFORM_META[key] ?? { icon: Cpu, label: platform.toUpperCase() };
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <div className="grid grid-cols-[2.5rem_minmax(0,1.2fr)_minmax(0,1fr)_5rem] items-center gap-2 px-5 py-5 border-b border-[#2a2a2a]">
    <div className="w-9 h-9 bg-[#1a1a1a] animate-pulse" />
    <div className="h-4 w-28 bg-[#1a1a1a] animate-pulse rounded-none" />
    <div className="h-4 w-24 bg-[#1a1a1a] animate-pulse rounded-none" />
    <div className="h-5 w-12 bg-[#1a1a1a] animate-pulse rounded-none ml-auto" />
  </div>
);

// Inline form for adding a username after selecting a platform
const AddUsernameForm: React.FC<{
  platform: string;
  onSubmit: (username: string) => void;
  onCancel: () => void;
  submitting: boolean;
}> = ({ platform, onSubmit, onCancel, submitting }) => {
  const [username, setUsername] = useState('');
  const meta = getMeta(platform);

  return (
    <div className="border border-white/20 bg-[#0a0a0a] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <meta.icon className="w-4 h-4 text-zinc-400" />
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white">{meta.label}</span>
      </div>
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && username.trim() && onSubmit(username.trim())}
          placeholder="your_username"
          className="flex-1 bg-black border border-[#2a2a2a] focus:border-white/50 outline-none px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-600 transition-colors"
        />
        <button
          onClick={() => username.trim() && onSubmit(username.trim())}
          disabled={!username.trim() || submitting}
          className="px-4 py-2 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase disabled:opacity-40 hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          LINK
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-[#2a2a2a] text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 hover:text-white hover:border-white/30 transition-colors"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────

export const ProfilesView: React.FC = () => {
  const { platforms, loading, error, submitting, addPlatform, editPlatform, removePlatform, refetch } = usePlatforms();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');

  const linked = new Set(platforms.map(p => p.platform.toLowerCase()));
  const available = ALL_SUPPORTED.filter(p => !linked.has(p));

  const handleSelectPlatform = (p: string) => {
    setSelectedPlatform(p);
  };

  const handleAddSubmit = async (username: string) => {
    if (!selectedPlatform) return;
    try {
      await addPlatform(selectedPlatform, username);
      setShowAdd(false);
      setSelectedPlatform(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditSubmit = async (platform: string, username: string) => {
    if (!username.trim()) return;
    try {
      await editPlatform(platform, username);
      setEditTarget(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (platform: string) => {
    setDeleteTarget(platform);
    try {
      await removePlatform(platform);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6">
        <div>
          <h1 className="font-bold text-4xl md:text-5xl tracking-tighter uppercase text-white mb-1">PROFILES</h1>
          <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-bold">
            {loading ? 'LOADING...' : `${platforms.length} LINKED`}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <div className="tracking-[0.3em] text-[10px] text-zinc-400 uppercase">
            SYS_TIME: {new Date().toISOString().split('T')[1].slice(0, 8)} UTC
          </div>
          <button
            onClick={refetch}
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
          ERR: {error}
        </div>
      )}

      {/* Table */}
      <div className="border border-[#2a2a2a]">
        {/* Column headers */}
        <div className="grid grid-cols-[2.5rem_minmax(0,1.2fr)_minmax(0,1fr)_5rem] items-center gap-2 px-5 py-3 bg-[#0a0a0a] border-b border-[#2a2a2a]">
          <span />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">PLATFORM</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">HANDLE</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 text-right pr-2">ACTION</span>
        </div>

        {/* Rows */}
        {loading
          ? Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)
          : platforms.length === 0
            ? (
              <div className="px-5 py-10 text-center text-[10px] tracking-[0.3em] text-zinc-600 uppercase font-bold">
                NO_PLATFORMS_LINKED
              </div>
            )
            : platforms.map((p, i) => {
              const meta = getMeta(p.platform);
              const isDeleting = deleteTarget === p.platform;
              return (
                <motion.div
                  key={p.platform}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="relative grid grid-cols-[2.5rem_minmax(0,1.2fr)_minmax(0,1fr)_5rem] items-center gap-2 px-5 py-5 border-b border-[#2a2a2a] last:border-b-0 hover:bg-white/[0.03] transition-all duration-300 group cursor-default"
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_12px_rgba(52,211,153,0.7)] transition-all duration-300" />

                  {/* Icon */}
                  <div className="w-9 h-9 border border-[#2a2a2a] flex items-center justify-center bg-[#0d0d0d] group-hover:border-white/30 transition-all duration-300">
                    <meta.icon className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors duration-300" />
                  </div>

                  {/* Platform */}
                  <span className="text-[13px] font-bold tracking-widest uppercase text-white">{meta.label}</span>

                  {/* Username */}
                  {editTarget === p.platform ? (
                    <input
                      autoFocus
                      type="text"
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEditSubmit(p.platform, editUsername);
                        if (e.key === 'Escape') setEditTarget(null);
                      }}
                      className="bg-black border border-[#2a2a2a] focus:border-white/50 outline-none px-2 py-1 text-sm font-mono text-white placeholder:text-zinc-600 transition-colors w-full"
                    />
                  ) : (
                    <span className="text-[13px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors truncate">
                      {p.username}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pr-2">
                    {editTarget === p.platform ? (
                      <>
                        <button
                          onClick={() => handleEditSubmit(p.platform, editUsername)}
                          disabled={submitting || !editUsername.trim()}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-30"
                          title="Save"
                        >
                          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-[10px] font-bold tracking-widest uppercase">Save</span>}
                        </button>
                        <button
                          onClick={() => setEditTarget(null)}
                          disabled={submitting}
                          className="text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
                          title="Cancel"
                        >
                          <span className="text-[10px] font-bold tracking-widest uppercase">X</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditTarget(p.platform);
                            setEditUsername(p.username);
                          }}
                          disabled={submitting}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-white disabled:opacity-30 flex items-center gap-1.5"
                          title={`Edit ${meta.label}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.platform)}
                          disabled={submitting}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400 disabled:opacity-30 flex items-center gap-1.5"
                          title={`Remove ${meta.label}`}
                        >
                          {isDeleting
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Add platform panel */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <AnimatePresence mode="wait">
          {!showAdd ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAdd(true)}
              id="add-platform-button"
              className="w-full border border-dashed border-[#2a2a2a] hover:border-white/30 py-5 flex items-center justify-center gap-3 text-zinc-600 hover:text-white transition-all duration-300 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">LINK_NEW_PLATFORM</span>
            </motion.button>
          ) : selectedPlatform ? (
            <motion.div key="username-form" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AddUsernameForm
                platform={selectedPlatform}
                onSubmit={handleAddSubmit}
                onCancel={() => { setSelectedPlatform(null); setShowAdd(false); }}
                submitting={submitting}
              />
            </motion.div>
          ) : (
            <motion.div key="platform-picker" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-[#2a2a2a]">
              <div className="px-6 py-3 bg-[#0a0a0a] flex justify-between items-center border-b border-[#2a2a2a]">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">SELECT_PLATFORM</span>
                <button
                  onClick={() => setShowAdd(false)}
                  className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
                >
                  CLOSE
                </button>
              </div>
              {available.length === 0 ? (
                <div className="px-6 py-8 text-center text-[10px] tracking-[0.3em] text-zinc-600 uppercase font-bold">
                  ALL_PLATFORMS_LINKED
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3">
                  {available.map(ap => {
                    const meta = getMeta(ap);
                    return (
                      <button
                        key={ap}
                        onClick={() => handleSelectPlatform(ap)}
                        className="px-6 py-5 flex items-center gap-4 text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all border-b border-r border-[#2a2a2a] group"
                      >
                        <meta.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{meta.label}</span>
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
