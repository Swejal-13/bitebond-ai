/**
 * Footer Component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-white dark:bg-surface-dark-card border-t border-gray-100 dark:border-gray-800 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <span className="text-2xl">❤️</span>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">
              BiteBond <span className="text-primary-500">AI</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Connecting hearts through food. Order food, send gifts, and celebrate every moment.
          </p>
          <div className="flex gap-3 mt-4">
            {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-500 transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Company</h4>
          <ul className="space-y-2.5">
            {['About Us', 'Careers', 'Blog', 'Press'].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Services</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Food Ordering', to: '/restaurants' },
              { label: 'Gift Marketplace', to: '/gifts' },
              { label: 'Remote Ordering', to: '/restaurants' },
              { label: 'AI Planner', to: '/' },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Support</h4>
          <ul className="space-y-2.5">
            {['Help Center', 'Track Order', 'Refund Policy', 'Contact Us'].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400 flex items-center gap-1">
          Made with <FiHeart className="text-primary-500" size={12} /> by the BiteBond team
        </p>
        <div className="flex gap-4">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
            <a key={item} href="#" className="text-xs text-gray-400 hover:text-primary-500 transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
