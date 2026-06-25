/**
 * AuthLayout
 * Split-screen layout for auth pages
 */

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => (
  <div className="min-h-screen flex bg-white dark:bg-surface-dark">
    {/* Left: Branding panel (hidden on mobile) */}
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 flex-col justify-between p-12 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/10" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/5" />

      <Link to="/" className="relative z-10">
        <span className="text-white text-2xl font-display font-bold">BiteBond AI ❤️</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10"
      >
        <p className="text-5xl font-display font-bold text-white leading-tight mb-6">
          Connecting<br />hearts through<br />food ❤️
        </p>
        <p className="text-white/80 text-lg max-w-sm leading-relaxed">
          Order food for yourself, surprise loved ones remotely, and celebrate every occasion with thoughtful gifts.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 mt-8">
          {['🍕 Food Ordering', '🎁 Gift Sending', '🤖 AI Powered', '📍 Remote Delivery'].map((f) => (
            <span key={f} className="bg-white/20 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
              {f}
            </span>
          ))}
        </div>
      </motion.div>

      <p className="text-white/50 text-sm relative z-10">© 2025 BiteBond AI. All rights reserved.</p>
    </div>

    {/* Right: Auth form */}
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-md">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="text-2xl font-display font-bold text-primary-500">
            BiteBond AI ❤️
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
