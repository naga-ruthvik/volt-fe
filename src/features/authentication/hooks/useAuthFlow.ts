import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth.api';
import { storeAccessToken } from '../../../shared/services/apiClient';

export type AuthStep = 'email' | 'otp' | 'username';

export function useAuthFlow(isOpen: boolean, onClose: () => void) {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [username, setUsername] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState('');

  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && step === 'email') setTimeout(() => emailInputRef.current?.focus(), 300);
  }, [isOpen, step]);

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRefs.current[0]?.focus(), 300);
  }, [step]);

  useEffect(() => {
    if (step === 'username') setTimeout(() => usernameInputRef.current?.focus(), 300);
  }, [step]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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
      }, 300);
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setError('');
    setIsLoading(true);

    const res = await authApi.generateOtp(email.trim());
    setIsLoading(false);

    if (res.success) {
      setIsNewUser(res.is_new_user ?? false);
      setStep('otp');
      setCountdown(60);
    } else {
      setError(res.message);
    }
  };

  const handleOtpSubmit = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) return;
    setError('');
    setIsLoading(true);

    const res = await authApi.verifyOtp(email, otpCode);
    setIsLoading(false);

    if (res.success) {
      if (res.access) {
        storeAccessToken(res.access);
      }
      const userIsNew = res.is_new_user ?? isNewUser;

      if (userIsNew) {
        setSuccess('OTP verified');
        setTimeout(() => { setSuccess(''); setStep('username'); }, 600);
      } else {
        localStorage.setItem('volt_user', JSON.stringify({
          email: res.email || email,
          username: res.username || '',
          isNewUser: false,
        }));
        setSuccess('Access granted');
        setTimeout(() => { onClose(); navigate('/dashboard'); }, 800);
      }
    } else {
      setError(res.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleUsernameSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) { setError('Username must be at least 3 characters'); return; }
    
    setError('');
    setIsLoading(true);
    const res = await authApi.completeProfile(trimmed);
    setIsLoading(false);

    if (res.success) {
      localStorage.setItem('volt_user', JSON.stringify({ email, username: res.username || trimmed, isNewUser: false }));
      setSuccess('Profile created');
      setTimeout(() => { onClose(); navigate('/dashboard'); }, 800);
    } else {
      setError(res.message || 'Username unavailable');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleEmailSubmit();
    if (!error) {
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      setSuccess('OTP resent');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return {
    step, setStep,
    email, setEmail,
    otp, setOtp,
    username, setUsername,
    isLoading, error, setError,
    success, countdown,
    emailInputRef, otpRefs, usernameInputRef,
    handleEmailSubmit, handleOtpSubmit, handleUsernameSubmit, handleResendOtp,
  };
}
