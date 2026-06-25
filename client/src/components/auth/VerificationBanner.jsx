import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiX, FiArrowRight } from 'react-icons/fi';
import { resendOtp } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const VerificationBanner = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, requiresVerification } = useSelector((s) => s.auth);
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  if (!isAuthenticated || !requiresVerification || user?.isVerified || dismissed) return null;

  const handleResend = async (e) => {
    e.preventDefault();
    setResending(true);
    const result = await dispatch(resendOtp());
    setResending(false);
    if (!result.error) toast.success('Verification OTP resent! Check your inbox.');
    else toast.error('Could not resend OTP. Please try from the verify page.');
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
        className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
            <FiMail className="text-amber-600 dark:text-amber-400" size={14} />
          </div>
          <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">Verify your email</span> — check your inbox for the OTP sent to <strong>{user?.email}</strong>.
          </p>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={handleResend} disabled={resending}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 transition-colors disabled:opacity-50">
              {resending ? 'Resending…' : 'Resend OTP'}
            </button>
            <Link to="/verify-email"
              className="flex items-center gap-1 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors">
              Verify now <FiArrowRight size={11} />
            </Link>
            <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-700 transition-colors">
              <FiX size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerificationBanner;
