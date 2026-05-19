import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Loader2 } from 'lucide-react';

interface UsernameStepProps {
  username: string;
  setUsername: (username: string) => void;
  isLoading: boolean;
  error: string;
  setError: (err: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const UsernameStep: React.FC<UsernameStepProps> = ({ username, setUsername, isLoading, error, setError, onSubmit, inputRef }) => {
  return (
    <motion.div
      key="username-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
          <User className="w-6 h-6 text-white" />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400">
          Identity configuration required
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-username" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Select Username
          </label>
          <input
            ref={inputRef}
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            placeholder="pilot_name"
            required
            minLength={3}
            pattern="^[a-zA-Z0-9_]{3,}$"
            title="Alphanumeric and underscores only, min 3 characters"
            className="w-full px-4 py-3.5 bg-[#1a1a1a] border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300"
          />
          <p className="text-[9px] font-mono text-zinc-600 mt-2 uppercase tracking-wider">
            Alphanumeric characters & underscores only
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-400 border border-red-400/20 bg-red-400/5 px-4 py-2.5">
              ERR: {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={isLoading || username.length < 3}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 bg-white text-black text-sm font-bold uppercase tracking-widest relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="relative z-10 flex items-center justify-center gap-3 font-mono">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>INITIALIZING...</span></>
            ) : (
              <span>COMPLETE SETUP</span>
            )}
          </div>
        </motion.button>
      </form>
    </motion.div>
  );
};
