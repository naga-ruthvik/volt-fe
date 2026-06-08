/**
 * SettingsView — Account and system configuration panel.
 * UI-only for now: no API wiring.
 */

import React, { useMemo, useState } from 'react';
import { getStoredUser } from '../../services/auth';

const TIMEZONE_OPTIONS = [
  { value: 'auto', label: 'AUTO (BROWSER)' },
  { value: 'UTC-12', label: 'UTC-12' },
  { value: 'UTC-11', label: 'UTC-11' },
  { value: 'UTC-10', label: 'UTC-10' },
  { value: 'UTC-09', label: 'UTC-09' },
  { value: 'UTC-08', label: 'UTC-08' },
  { value: 'UTC-07', label: 'UTC-07' },
  { value: 'UTC-06', label: 'UTC-06' },
  { value: 'UTC-05', label: 'UTC-05' },
  { value: 'UTC-04', label: 'UTC-04' },
  { value: 'UTC-03', label: 'UTC-03' },
  { value: 'UTC-02', label: 'UTC-02' },
  { value: 'UTC-01', label: 'UTC-01' },
  { value: 'UTC+00', label: 'UTC+00' },
  { value: 'UTC+01', label: 'UTC+01' },
  { value: 'UTC+02', label: 'UTC+02' },
  { value: 'UTC+03', label: 'UTC+03' },
  { value: 'UTC+04', label: 'UTC+04' },
  { value: 'UTC+05', label: 'UTC+05' },
  { value: 'UTC+06', label: 'UTC+06' },
  { value: 'UTC+07', label: 'UTC+07' },
  { value: 'UTC+08', label: 'UTC+08' },
  { value: 'UTC+09', label: 'UTC+09' },
  { value: 'UTC+10', label: 'UTC+10' },
  { value: 'UTC+11', label: 'UTC+11' },
  { value: 'UTC+12', label: 'UTC+12' },
];

export const SettingsView: React.FC = () => {
  const user = getStoredUser();
  const [identityId, setIdentityId] = useState(user?.username ?? '');
  const [timezone, setTimezone] = useState('auto');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    const handle = user?.username ? `/${user.username}` : '/YOUR_ID';
    return `[![Volt Activity](https://volt.app/badge${handle})](https://volt.app${handle})`;
  }, [user?.username]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-2">
        <div>
          <h1 className="font-bold text-4xl md:text-5xl tracking-tighter uppercase text-white mb-1">SETTINGS</h1>
          <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-bold">
            SYSTEM_CONFIG // IDENTITY_PROTOCOL // SAFETY_CONTROLS
          </p>
        </div>
        <div className="mt-3 md:mt-0 text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
          SYS_TIME: {new Date().toISOString().split('T')[1].slice(0, 8)} UTC
        </div>
      </header>

      {/* Identity */}
      <section className="border border-[#2a2a2a] bg-black">
        <div className="px-5 py-3 border-b border-[#2a2a2a] bg-[#0a0a0a]">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">IDENTITY_PROTOCOL</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                AUTH_EMAIL
              </label>
              <input
                value={user?.email ?? 'NOT_LINKED'}
                readOnly
                className="w-full bg-black border border-[#2a2a2a] px-3 py-2 text-sm font-mono text-zinc-400"
              />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              OTP_ONLY_LOGIN
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                IDENTITY_ID
              </label>
              <input
                value={identityId}
                onChange={e => setIdentityId(e.target.value)}
                placeholder="ENTER_IDENTITY_ID"
                className="w-full bg-black border border-[#2a2a2a] px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-600 focus:border-white/50 outline-none"
              />
            </div>
            <button
              type="button"
              className="h-10 px-4 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-zinc-200 transition-colors"
            >
              UPDATE_ID
            </button>
          </div>
        </div>
      </section>

      {/* Integration Snippets */}
      <section className="border border-[#2a2a2a] bg-black">
        <div className="px-5 py-3 border-b border-[#2a2a2a] bg-[#0a0a0a]">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">INTEGRATION_SNIPPETS</span>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-bold">EMBED_ACTIVITY_HEATMAP</p>
          <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-4 font-mono text-[12px] text-zinc-200 whitespace-pre-wrap">
            {snippet}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 border border-white text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors"
          >
            {copied ? 'COPIED' : 'COPY_MARKDOWN'}
          </button>
        </div>
      </section>

      {/* Timezone */}
      <section className="border border-[#2a2a2a] bg-black">
        <div className="px-5 py-3 border-b border-[#2a2a2a] bg-[#0a0a0a]">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">TIMEZONE_LOCK</span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
              CALIBRATION_ZONE
            </label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full bg-black border border-[#2a2a2a] px-3 py-2 text-sm font-mono text-white focus:border-white/50 outline-none"
            >
              {TIMEZONE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="h-10 px-4 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-zinc-200 transition-colors"
          >
            CALIBRATE
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="border border-red-500/30 bg-red-500/5">
        <div className="px-5 py-3 border-b border-red-500/30">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-red-400">DESTRUCTION_LEVEL</span>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-[10px] tracking-[0.2em] text-red-300 uppercase font-bold">
            THIS_ACTION_IS_PERMANENT
          </p>
          <button
            type="button"
            className="px-4 py-3 border border-red-400 text-red-300 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-red-500 hover:text-white transition-colors"
          >
            BURN_PROTOCOL
          </button>
        </div>
      </section>
    </div>
  );
};
