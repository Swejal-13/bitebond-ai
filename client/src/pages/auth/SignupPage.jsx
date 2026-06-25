import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { signup, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, requiresVerification } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (isAuthenticated && requiresVerification) navigate('/verify-email', { replace: true });
    if (isAuthenticated && !requiresVerification) navigate('/', { replace: true });
    return () => dispatch(clearError());
  }, [isAuthenticated, requiresVerification, navigate, dispatch]);

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(signup(form));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Create account ❤️</h1>
        <p className="text-gray-500 dark:text-gray-400">Join BiteBond and start spreading joy through food</p>
      </div>

      <a href={`${API_URL}/auth/google`}
        className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-surface-dark-muted text-gray-700 dark:text-gray-200 font-medium text-sm transition-all duration-200 mb-6">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.121 17.64 11.834 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
        Sign up with Google
      </a>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
        <div className="relative flex justify-center"><span className="px-3 bg-white dark:bg-surface-dark text-sm text-gray-400">or sign up with email</span></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: FiUser, req: true },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: FiMail, req: true },
          { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '9876543210', icon: FiPhone, req: false },
        ].map(({ name, label, type, placeholder, icon: Icon, req }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
            <div className="relative">
              <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type={type} name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                placeholder={placeholder} className="input pl-10" required={req} />
            </div>
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 6 characters" className="input pl-10 pr-10" required />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-500 hover:underline">Terms of Service</a> and{' '}
          <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>.
        </p>
        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {isLoading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-600">Log in</Link>
      </p>
    </motion.div>
  );
};

export default SignupPage;
