/**
 * Email Verification Page — 6-box OTP with countdown & resend
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { verifyEmail, resendOtp, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;

const VerifyEmailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error, requiresVerification } = useSelector((s) => s.auth);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!requiresVerification && !verified) navigate('/', { replace: true });
    return () => dispatch(clearError());
  }, [requiresVerification, verified, navigate, dispatch]);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const n = [...otp]; n[index] = value.slice(-1); setOtp(n);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (n.every((d) => d !== '')) handleVerify(n.join(''));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!p) return;
    const n = Array(OTP_LENGTH).fill('');
    p.split('').forEach((d, i) => { n[i] = d; });
    setOtp(n);
    inputRefs.current[Math.min(p.length, OTP_LENGTH - 1)]?.focus();
    if (p.length === OTP_LENGTH) handleVerify(p);
  };

  const handleVerify = async (code) => {
    const result = await dispatch(verifyEmail(code || otp.join('')));
    if (!result.error) {
      setVerified(true);
      toast.success('Email verified! Welcome to BiteBond! ❤️');
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } else {
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    const result = await dispatch(resendOtp());
    if (!result.error) {
      toast.success('New OTP sent! Check your inbox.');
      setCountdown(60); setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  if (verified) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <FiCheckCircle className="text-green-500" size={40} />
      </motion.div>
      <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Email Verified! ❤️</h2>
      <p className="text-gray-500 dark:text-gray-400">Redirecting you to BiteBond…</p>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-6">
        <FiMail className="text-primary-500" size={28} />
      </div>
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Check your email 📬</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-1">We sent a 6-digit code to</p>
      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-8">{user?.email}</p>

      <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input key={i} ref={(el) => (inputRefs.current[i] = el)}
            type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200
              bg-white dark:bg-surface-dark-muted text-gray-900 dark:text-white
              focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800
              ${digit ? 'border-primary-400 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700'}`}
          />
        ))}
      </div>

      <button onClick={() => handleVerify()} disabled={isLoading || otp.some((d) => !d)}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 mb-6">
        {isLoading
          ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying…</>
          : 'Verify Email'}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Didn't receive the code?</p>
        <button onClick={handleResend} disabled={!canResend || isLoading}
          className={`flex items-center gap-2 mx-auto text-sm font-semibold transition-colors
            ${canResend ? 'text-primary-500 hover:text-primary-600' : 'text-gray-400 cursor-not-allowed'}`}>
          <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
        </button>
      </div>
    </motion.div>
  );
};

export default VerifyEmailPage;
