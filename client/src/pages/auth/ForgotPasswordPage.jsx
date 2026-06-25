/**
 * Forgot Password — 3-step flow: email → OTP → new password
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { forgotPassword, verifyResetOtp, resetPassword, clearError, setResetEmail } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const OTP_LEN = 6;
const sv = { enter: { opacity: 0, x: 30 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((s) => s.auth);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LEN).fill(''));
  const [pw, setPw] = useState(''); const [cpw, setCpw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const refs = useRef([]);

  useEffect(() => { if (error) toast.error(error); }, [error]);
  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const sendOtp = async (e) => {
    e.preventDefault();
    const r = await dispatch(forgotPassword(email));
    if (!r.error) { dispatch(setResetEmail(email)); toast.success('OTP sent! Check your inbox.'); setStep(1); }
  };

  const changeOtp = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
    if (v && i < OTP_LEN - 1) refs.current[i + 1]?.focus();
  };
  const keyOtp = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus(); };
  const pasteOtp = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
    const n = Array(OTP_LEN).fill(''); p.split('').forEach((d, i) => { n[i] = d; }); setOtp(n);
    refs.current[Math.min(p.length - 1, OTP_LEN - 1)]?.focus();
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LEN) return toast.error('Enter the complete 6-digit OTP');
    const r = await dispatch(verifyResetOtp({ email, otp: code }));
    if (!r.error) { toast.success('OTP verified!'); setStep(2); }
  };

  const doReset = async (e) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error('Password must be at least 6 characters');
    if (pw !== cpw) return toast.error('Passwords do not match');
    const r = await dispatch(resetPassword(pw));
    if (!r.error) setStep(3);
  };

  const pwStrength = () => {
    if (!pw) return 0;
    if (pw.length < 6) return 1;
    if (pw.length < 10) return 2;
    if (/[A-Z]/.test(pw) && /\d/.test(pw)) return 4;
    return 3;
  };
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];

  const Spinner = () => <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />;

  return (
    <div>
      {step < 3 && (
        <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 mb-8 transition-colors">
          <FiArrowLeft size={15} /> Back to login
        </Link>
      )}
      <AnimatePresence mode="wait">
        {step === 3 && (
          <motion.div key="success" variants={sv} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-green-500" size={40} />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Password reset! 🎉</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Your password has been updated successfully.</p>
            <Link to="/login" className="btn-primary inline-block py-3 px-8">Log in now</Link>
          </motion.div>
        )}

        {step === 0 && (
          <motion.div key="email" variants={sv} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-6">
              <FiMail className="text-primary-500" size={24} />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Forgot password?</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your email and we'll send you a reset code.</p>
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input pl-10" required autoFocus />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {isLoading ? <><Spinner />Sending…</> : 'Send Reset Code'}
              </button>
            </form>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="otp" variants={sv} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Check your email 📬</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-1">We sent a 6-digit code to</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-8">{email}</p>
            <div className="flex gap-3 justify-center mb-8" onPaste={pasteOtp}>
              {otp.map((d, i) => (
                <input key={i} ref={(el) => (refs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => changeOtp(i, e.target.value)} onKeyDown={(e) => keyOtp(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200
                    bg-white dark:bg-surface-dark-muted text-gray-900 dark:text-white
                    focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                    ${d ? 'border-primary-400 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700'}`}
                />
              ))}
            </div>
            <button onClick={verifyOtp} disabled={isLoading || otp.some((d) => !d)}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mb-4">
              {isLoading ? <><Spinner />Verifying…</> : 'Verify Code'}
            </button>
            <button onClick={() => { setStep(0); setOtp(Array(OTP_LEN).fill('')); }}
              className="w-full text-sm text-gray-500 hover:text-primary-500 transition-colors">
              Wrong email? Go back
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="newpw" variants={sv} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-6">
              <FiLock className="text-primary-500" size={24} />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Set new password 🔐</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Choose a strong new password for your account.</p>
            <form onSubmit={doReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type={showPw ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)}
                    placeholder="Min. 6 characters" className="input pl-10 pr-10" required autoFocus />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {pw && (
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map((l) => (
                      <div key={l} className={`h-1 flex-1 rounded-full transition-colors ${l <= pwStrength() ? strengthColor[pwStrength()] : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type={showPw ? 'text' : 'password'} value={cpw} onChange={(e) => setCpw(e.target.value)}
                    placeholder="Repeat your password" className="input pl-10" required />
                </div>
                {cpw && pw !== cpw && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {isLoading ? <><Spinner />Resetting…</> : 'Reset Password'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPasswordPage;
