import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Loader2 } from 'lucide-react';

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string;
  setError: (err: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const EmailStep: React.FC<EmailStepProps> = ({ email, setEmail, isLoading, error, setError, onSubmit, inputRef }) => {
  return (
    <motion.form
      key="email-step"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <div>
        <label htmlFor="login-email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
          Email Address
        </label>
        <input
          ref={inputRef}
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="you@domain.dev"
          required
          autoComplete="email"
          className="w-full px-4 py-3.5 bg-[#1a1a1a] border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300"
        />
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
        disabled={isLoading || !email.trim()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-4 bg-white text-black text-sm font-bold uppercase tracking-widest relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
      >
        <div className="relative z-10 flex items-center justify-center gap-3 font-mono">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>TRANSMITTING...</span></>
          ) : (
            <>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">[</span>
              <span>SEND OTP</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">]</span>
              <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform duration-300" />
            </>
          )}
        </div>
      </motion.button>
    </motion.form>
  );
};
