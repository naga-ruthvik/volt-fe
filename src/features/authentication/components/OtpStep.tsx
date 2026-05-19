import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';

interface OtpStepProps {
  email: string;
  otp: string[];
  setOtp: (otp: string[]) => void;
  isLoading: boolean;
  error: string;
  setError: (err: string) => void;
  countdown: number;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

export const OtpStep: React.FC<OtpStepProps> = ({ email, otp, setOtp, isLoading, error, setError, countdown, onSubmit, onResend, otpRefs }) => {
  const handleOtpChange = (index: number, value: string) => {
    setError('');
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(v => v !== '')) {
      onSubmit(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      onSubmit(pastedData);
    }
  };

  return (
    <motion.div
      key="otp-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400">
          Verification code sent to
        </p>
        <p className="text-sm font-mono text-white break-all bg-white/5 py-2 px-4 inline-block border border-white/10">
          {email}
        </p>
      </div>

      <div className="flex justify-between gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => { otpRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleOtpChange(index, e.target.value)}
            onKeyDown={e => handleOtpKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 text-center text-xl font-mono bg-[#1a1a1a] border transition-all duration-300 focus:outline-none focus:scale-105 ${digit ? 'border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-white/10 text-white/50 focus:border-white/50'}`}
          />
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-400 text-center">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <motion.button
          onClick={() => onSubmit()}
          disabled={isLoading || otp.some(v => v === '')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 bg-white text-black text-sm font-bold uppercase tracking-widest relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="relative z-10 flex items-center justify-center gap-3 font-mono">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>VERIFYING...</span></>
            ) : (
              <span>VERIFY SEQUENCE</span>
            )}
          </div>
        </motion.button>

        <button
          onClick={onResend}
          disabled={countdown > 0 || isLoading}
          className="w-full py-3 text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-3 h-3 ${countdown > 0 ? 'opacity-50' : ''}`} />
          {countdown > 0 ? `RESEND AVAILABLE IN ${countdown}S` : 'RESEND CODE'}
        </button>
      </div>
    </motion.div>
  );
};
