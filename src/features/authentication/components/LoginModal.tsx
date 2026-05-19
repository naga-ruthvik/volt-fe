import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { EmailStep } from './EmailStep';
import { OtpStep } from './OtpStep';
import { UsernameStep } from './UsernameStep';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const {
    step,
    email, setEmail,
    otp, setOtp,
    username, setUsername,
    isLoading, error, setError,
    success, countdown,
    emailInputRef, otpRefs, usernameInputRef,
    handleEmailSubmit, handleOtpSubmit, handleUsernameSubmit, handleResendOtp
  } = useAuthFlow(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isLoading) onClose();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              className="bg-[#0a0a0a] border border-white/10 w-full max-w-md relative overflow-hidden"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                    System.Auth_{step.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-1 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Main Content */}
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-2">
                    {step === 'email' && 'Initiate Access'}
                    {step === 'otp' && 'Verify Identity'}
                    {step === 'username' && 'System Config'}
                  </h2>
                  <div className="h-px w-12 bg-white mb-4" />
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    {step === 'email' && 'Enter credentials to establish connection.'}
                    {step === 'otp' && 'Awaiting security clearance code.'}
                    {step === 'username' && 'Finalize pilot identification details.'}
                  </p>
                </div>

                <div className="relative min-h-[200px]">
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4"
                      >
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm font-mono uppercase tracking-[0.2em] text-white">
                          {success}
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        {step === 'email' && (
                          <EmailStep
                            email={email}
                            setEmail={setEmail}
                            isLoading={isLoading}
                            error={error}
                            setError={setError}
                            onSubmit={handleEmailSubmit}
                            inputRef={emailInputRef}
                          />
                        )}

                        {step === 'otp' && (
                          <OtpStep
                            email={email}
                            otp={otp}
                            setOtp={setOtp}
                            isLoading={isLoading}
                            error={error}
                            setError={setError}
                            countdown={countdown}
                            onSubmit={handleOtpSubmit}
                            onResend={handleResendOtp}
                            otpRefs={otpRefs}
                          />
                        )}

                        {step === 'username' && (
                          <UsernameStep
                            username={username}
                            setUsername={setUsername}
                            isLoading={isLoading}
                            error={error}
                            setError={setError}
                            onSubmit={handleUsernameSubmit}
                            inputRef={usernameInputRef}
                          />
                        )}
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/20 opacity-50" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-white/20 opacity-50" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
