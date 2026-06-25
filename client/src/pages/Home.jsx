/**
 * Home Page
 * Hero + Features + How It Works + CTA
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiZap, FiHeart, FiGift, FiMapPin, FiClock } from 'react-icons/fi';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const features = [
  {
    icon: '🍕',
    title: 'Order Food',
    description: 'Browse hundreds of restaurants. Order your favourite meals with real-time tracking.',
    color: 'from-orange-400 to-red-400',
  },
  {
    icon: '🎁',
    title: 'Send Gifts',
    description: 'Surprise loved ones with cakes, flowers, chocolates, and personalised hampers.',
    color: 'from-pink-400 to-rose-500',
  },
  {
    icon: '📍',
    title: 'Remote Ordering',
    description: 'Order food for family and friends anywhere. Add a surprise note or voice message.',
    color: 'from-purple-400 to-indigo-500',
  },
  {
    icon: '🤖',
    title: 'AI Powered',
    description: 'Get personalised food and gift recommendations powered by Google Gemini AI.',
    color: 'from-blue-400 to-cyan-400',
  },
];

const occasions = ['🎂 Birthday', '💑 Anniversary', '🎊 Congratulations', '🌸 Festival', '💙 Get Well Soon', '🙏 Thank You'];

const steps = [
  { step: '01', title: 'Choose', description: 'Pick food from top restaurants or browse our gift marketplace', icon: FiHeart },
  { step: '02', title: 'Personalise', description: 'Add a message, voice note, photo, or let AI generate the perfect wish', icon: FiZap },
  { step: '03', title: 'Send', description: 'Schedule delivery for the perfect moment, even anonymously', icon: FiMapPin },
];

const Home = () => (
  <div className="overflow-hidden">
    {/* ── Hero ───────────────────────────────────────────────────────────────── */}
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-surface-dark dark:to-gray-900 pt-16 pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-100/60 dark:bg-primary-900/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-100/60 dark:bg-accent-900/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <FiStar size={13} />
              AI-Powered Food & Gift Platform
            </span>

            <h1 className="text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Connecting<br />
              hearts through<br />
              <span className="gradient-text">food ❤️</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
              Order food for yourself or surprise someone special — anywhere in the world. Celebrate every occasion with food, gifts, and heartfelt messages.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/celebrate" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                Send a Celebration ❤️ <FiArrowRight size={16} />
              </Link>
              <Link to="/restaurants" className="btn-outline flex items-center gap-2 text-base px-6 py-3">
                Order Food Now
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10">
              {[
                { value: '50K+', label: 'Happy Users' },
                { value: '200+', label: 'Restaurants' },
                { value: '4.9★', label: 'Rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Central glow */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 opacity-20 blur-3xl" />

              {/* Central emoji card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-3xl bg-white dark:bg-surface-dark-card shadow-2xl flex flex-col items-center justify-center gap-3 border border-gray-100 dark:border-gray-700">
                  <span className="text-7xl">❤️</span>
                  <p className="font-display font-semibold text-gray-800 dark:text-white text-sm">BiteBond AI</p>
                </div>
              </div>

              {/* Floating cards */}
              {[
                { emoji: '🍕', label: 'Pizza ordered!', sub: 'Arriving in 25 min', pos: 'top-4 left-0', delay: 0 },
                { emoji: '🎂', label: 'Birthday cake', sub: 'Sent to Mom ❤️', pos: 'top-4 right-0', delay: 0.2 },
                { emoji: '🌸', label: 'Flowers + note', sub: 'Surprise mode 🎉', pos: 'bottom-4 left-0', delay: 0.4 },
                { emoji: '🤖', label: 'AI suggestion', sub: 'Perfect for her!', pos: 'bottom-4 right-0', delay: 0.6 },
              ].map(({ emoji, label, sub, pos, delay }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + delay, duration: 0.4 }}
                  className={`absolute ${pos} card p-3 w-40 shadow-lg`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white leading-none">{label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Occasions strip ────────────────────────────────────────────────────── */}
    <section className="py-6 bg-white dark:bg-surface-dark-card border-y border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex gap-4 animate-[slide_20s_linear_infinite] whitespace-nowrap w-max">
        {[...occasions, ...occasions].map((o, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-sm font-medium px-4 py-1.5 rounded-full">
            {o}
          </span>
        ))}
      </div>
    </section>

    {/* ── Features ───────────────────────────────────────────────────────────── */}
    <section className="py-20 bg-white dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-14">
          <h2 className="section-title mb-3">Everything you need to celebrate</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            One platform for food, gifts, and heartfelt surprises — powered by AI.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-hover p-6 group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── How It Works ───────────────────────────────────────────────────────── */}
    <section className="py-20 bg-gray-50 dark:bg-surface-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-14">
          <h2 className="section-title mb-3">How it works</h2>
          <p className="text-gray-500 dark:text-gray-400">Three simple steps to spread happiness</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 to-accent-200 dark:from-primary-800 dark:to-accent-800" />

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-dark shadow-card border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                  <s.icon className="text-primary-500" size={24} />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA Banner ─────────────────────────────────────────────────────────── */}
    <section className="py-20 bg-gradient-to-r from-primary-500 to-accent-500">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div {...fadeUp}>
          <span className="text-5xl mb-6 block">❤️</span>
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Start spreading joy today
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of people who use BiteBond to celebrate every moment with food and gifts.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/signup" className="bg-white text-primary-600 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors flex items-center gap-2">
              Get Started Free <FiArrowRight size={16} />
            </Link>
            <Link to="/restaurants" className="bg-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30">
              Browse Restaurants
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default Home;
