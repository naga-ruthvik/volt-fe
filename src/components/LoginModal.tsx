/**
 * LoginModal — Brutalist OTP-only auth overlay for Volt.
 * Flow: Email → Generate OTP → Verify OTP
 *   → Existing user: redirect to Dashboard
 *   → New user: Username setup → redirect to Dashboard
 */

import React, { useState, useRef, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowLeft, Loader2, X, Check, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  generateOtp,
  verifyOtp,
  completeProfile,
  storeAccessToken,
  storeUser,
} from '../services/auth';

type Step = 'email' | 'otp' | 'username';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // ── State ──
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [username, setUsername] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState('');

  // Temp token storage between OTP verify and profile complete
  const tokensRef = useRef<{ access: string; refresh: string } | null>(null);

  // ── Refs ──
  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // ── Focus management ──
  useEffect(() => {
    if (isOpen && step === 'email') setTimeout(() => emailInputRef.current?.focus(), 300);
  }, [isOpen, step]);

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRefs.current[0]?.focus(), 300);
  }, [step]);

  useEffect(() => {
    if (step === 'username') setTimeout(() => usernameInputRef.current?.focus(), 300);
  }, [step]);

  // ── Countdown for resend ──
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // ── Escape to close ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // ── Reset on close ──
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('email');
        setEmail('');
        setOtp(['', '', '', '', '', '']);
        setUsername('');
        setIsNewUser(false);
        setError('');
        setSuccess('');
        setIsLoading(false);
        setCountdown(0);
        tokensRef.current = null;
      }, 300);
    }
  }, [isOpen]);

  // ── Handlers ──

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setIsLoading(true);

    const res = await generateOtp(email.trim());
    setIsLoading(false);

    if (res.success) {
      setIsNewUser(res.is_new_user ?? false);
      setStep('otp');
      setCountdown(60);
    } else {
      setError(res.message);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (value && index === 5 && newOtp.every((d) => d !== '')) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    if (pasted.length === 6) handleOtpSubmit(pasted);
    else otpRefs.current[pasted.length]?.focus();
  };

  const handleOtpSubmit = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) return;
    setError('');
    setIsLoading(true);

    const res = await verifyOtp(email, otpCode);
    setIsLoading(false);

    console.log('[Volt Auth] OTP verify result:', {
      success: res.success,
      hasAccess: !!res.access,
      hasRefresh: !!res.refresh,
      is_new_user: res.is_new_user,
      username: res.username,
      _raw: res._raw,
    });

    if (res.success) {
      // Store access token (refresh token is in HttpOnly cookie)
      if (res.access) {
        storeAccessToken(res.access);
      }

      const userIsNew = res.is_new_user ?? isNewUser;
      console.log('[Volt Auth] User is new:', userIsNew);

      if (userIsNew) {
        // New user → username setup
        setSuccess('OTP verified');
        setTimeout(() => { setSuccess(''); setStep('username'); }, 600);
      } else {
        // Existing user → store user & go to dashboard
        storeUser({
          email: res.email || email,
          username: res.username || '',
          isNewUser: false,
        });
        setSuccess('Access granted');
        setTimeout(() => { onClose(); navigate('/dashboard'); }, 800);
      }
    } else {
      setError(res.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    if (trimmed.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) { setError('Only letters, numbers, _ and - allowed'); return; }

    setError('');
    setIsLoading(true);

    const res = await completeProfile(trimmed);
    setIsLoading(false);

    if (res.success) {
      storeUser({ email, username: res.username || trimmed, isNewUser: false });
      setSuccess('Profile created');
      setTimeout(() => { onClose(); navigate('/dashboard'); }, 800);
    } else {
      setError(res.message || 'Username unavailable');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setIsLoading(true);
    const res = await generateOtp(email.trim());
    setIsLoading(false);
    if (res.success) {
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      setSuccess('OTP resent');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(res.message);
    }
  };

  const goBackToEmail = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
  };

  // ── Step label ──
  const stepLabel = step === 'email' ? 'IDENTIFY' : step === 'otp' ? 'VERIFY' : 'CONFIGURE';

  // ── Render ──
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] mx-4 border border-white/10 bg-brand-bg overflow-hidden"
          >
            {/* Terminal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white/20" />
                <div className="w-2 h-2 bg-white/20" />
                <div className="w-2 h-2 bg-white/20" />
              </div>
              <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em]">
                AUTH // {stepLabel}
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors" aria-label="Close" id="login-modal-close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Crosshair decorations */}
            <div className="absolute top-12 left-2 text-white/10 text-[10px] font-mono leading-none">+</div>
            <div className="absolute top-12 right-2 text-white/10 text-[10px] font-mono leading-none">+</div>
            <div className="absolute bottom-2 left-2 text-white/10 text-[10px] font-mono leading-none">+</div>
            <div className="absolute bottom-2 right-2 text-white/10 text-[10px] font-mono leading-none">+</div>

            {/* Step indicators */}
            <div className="px-10 pt-6 pb-0">
              <div className="flex items-center justify-center gap-2 mb-2">
                {(['email', 'otp', 'username'] as Step[]).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 flex items-center justify-center text-[9px] font-mono font-bold border transition-all duration-300 ${
                      step === s ? 'border-white bg-white text-black' :
                      (['email', 'otp', 'username'].indexOf(step) > i) ? 'border-white/40 bg-white/10 text-white/60' :
                      'border-white/10 text-white/20'
                    }`}>
                      {(['email', 'otp', 'username'].indexOf(step) > i) ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    {i < 2 && <div className={`w-8 h-[1px] transition-all duration-300 ${(['email', 'otp', 'username'].indexOf(step) > i) ? 'bg-white/40' : 'bg-white/10'}`} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-10 py-8">
              {/* Logo + Title */}
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="w-10 h-10 bg-white flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                  <Zap className="w-5 h-5 text-black fill-current" />
                </motion.div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter text-white">
                  {step === 'username' ? 'Choose Username' : 'Login to Volt'}
                </h2>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-muted mt-2">
                  {step === 'email' ? 'ENTER YOUR EMAIL' : step === 'otp' ? 'VERIFICATION PROTOCOL' : 'IDENTITY SETUP'}
                </p>
              </div>

              {/* Success toast */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-4 py-2.5 text-center mb-4"
                  >
                    ✓ {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* ===== STEP 1: EMAIL ===== */}
                {step === 'email' && (
                  <motion.form
                    key="email-step"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleEmailSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <label htmlFor="login-email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted mb-3">
                        Email Address
                      </label>
                      <input
                        ref={emailInputRef}
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="you@domain.dev"
                        required
                        autoComplete="email"
                        className="w-full px-4 py-3.5 bg-brand-accent-gray/60 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300"
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
                      <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    </motion.button>
                  </motion.form>
                )}

                {/* ===== STEP 2: OTP ===== */}
                {step === 'otp' && (
                  <motion.div
                    key="otp-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <button onClick={goBackToEmail} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted hover:text-white transition-colors group" id="otp-back-button">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <div className="text-center">
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-brand-muted">OTP sent to</p>
                      <p className="text-sm font-mono text-white mt-1 truncate">{email}</p>
                    </div>

                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          id={`otp-input-${i}`}
                          className={`w-12 h-14 text-center text-lg font-mono font-bold bg-brand-accent-gray/60 border text-white focus:outline-none transition-all duration-300 ${
                            digit ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-white/10 focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                          }`}
                        />
                      ))}
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="text-[10px] font-mono uppercase tracking-[0.15em] text-red-400 border border-red-400/20 bg-red-400/5 px-4 py-2.5 text-center">
                          ERR: {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      onClick={() => handleOtpSubmit()}
                      disabled={isLoading || otp.some((d) => !d)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 bg-white text-black text-sm font-bold uppercase tracking-widest relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-3 font-mono">
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /><span>VALIDATING...</span></>
                        ) : (
                          <>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">[</span>
                            <span>VERIFY OTP</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">]</span>
                          </>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    </motion.button>

                    <div className="text-center pt-1">
                      <button
                        onClick={handleResendOtp}
                        disabled={countdown > 0}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        id="resend-otp-button"
                      >
                        {countdown > 0 ? `RESEND OTP IN ${countdown}s` : 'RESEND OTP'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ===== STEP 3: USERNAME (New users only) ===== */}
                {step === 'username' && (
                  <motion.form
                    key="username-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleUsernameSubmit}
                    className="space-y-5"
                  >
                    <div className="text-center mb-2">
                      <div className="w-12 h-12 border border-white/20 flex items-center justify-center mx-auto mb-3 bg-brand-accent-gray/60">
                        <User className="w-6 h-6 text-white/60" />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-brand-muted">
                        Welcome aboard! Pick a unique username.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="setup-username" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted mb-3">
                        Username
                      </label>
                      <input
                        ref={usernameInputRef}
                        id="setup-username"
                        type="text"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value.toLowerCase()); setError(''); }}
                        placeholder="e.g. volt_coder"
                        required
                        minLength={3}
                        maxLength={30}
                        autoComplete="username"
                        className="w-full px-4 py-3.5 bg-brand-accent-gray/60 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300"
                      />
                      <p className="text-[9px] font-mono text-white/20 mt-2 uppercase tracking-wider">
                        3–30 chars · letters, numbers, _ or -
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
                      disabled={isLoading || username.trim().length < 3}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 bg-white text-black text-sm font-bold uppercase tracking-widest relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-3 font-mono">
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /><span>CONFIGURING...</span></>
                        ) : (
                          <>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">[</span>
                            <span>COMPLETE SETUP</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">]</span>
                            <Check className="w-4 h-4 group-hover:scale-125 transition-transform duration-300" />
                          </>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
              className="h-[2px] bg-gradient-to-r from-transparent via-white to-transparent origin-left"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
