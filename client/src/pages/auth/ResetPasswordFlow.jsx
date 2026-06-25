/**
 * ResetPasswordFlow — Orchestrates all 3 steps of password reset:
 * Step 1: Enter email (ForgotPasswordPage)
 * Step 2: Enter OTP
 * Step 3: Enter new password
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { verifyResetOtp, resetPassword, clearError, clearResetFlow } from '../../redux/slices/authSlice';
import ForgotPasswordPage from './ForgotPasswordPage';
import OtpInput from '../../components/auth/OtpInput';
import toast from 'react-hot-toast';

const STEPS = ['email', 'otp', 'password'];

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const ResetPasswordFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, resetEmail } = useSelector((s) => s.auth);

  const [step, setStep] = useState(0); // 0=email, 1=otp, 2=password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  useEffect(() => {
    return () => { dispatch(clearResetFlow()); };
  }, [dispatch]);

  const handleOtpComplete = async (otp) => {
    if (!resetEmail) return toast.error('Session expired. Please start again.');
    const result = await dispatch(verifyResetOtp({ email: resetEmail, otp }));
    if (!result.error) {
      toast.success('OTP verified! Set your new password.');
      setStep(2);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    const result = await dispatch(resetPassword(password));
    if (!result.error) {
      toast.success('Password reset successfully! Please log in.');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div>
      {/* Step indicator */}
      {step > 0 && (
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 0: Email */}
        {step === 0 && (
          <motion.div key="email" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <ForgotPasswordPage onNext={() => setStep(1)} />
          </motion.div>
        )}

        {/* Step 1: OTP */}
        {step === 1 && (
          <motion.div key="otp" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <button onClick={() => setStep(0)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-8 transition-colors">
              <FiArrowLeft size={14} /> Back
            </button>

            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Enter reset code</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                We sent a 6-digit code to <span className="font-semibold text-gray-700 dark:text-gray-300">{resetEmail}</span>
              </p>
            </div>

            <OtpInput length={6} onComplete={handleOtpComplete} disabled={isLoading} />

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-primary-500 text-sm mt-6">
                <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                Verifying…
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">
              The code expires in 10 minutes.
            </p>
          </motion.div>
        )}

        {/* Step 2: New Password */}
        {step === 2 && (
          <motion.div key="password" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Set new password</h1>
              <p className="text-gray-500 dark:text-gray-400">Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[6, 8, 12].map((threshold, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${password.length >= threshold ? ['bg-red-400', 'bg-yellow-400', 'bg-green-500'][i] : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {password.length < 6 ? 'Too short' : password.length < 8 ? 'Weak' : password.length < 12 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Resetting…</>
                ) : 'Reset Password'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResetPasswordFlow;
