/**
 * Navbar Component
 * Responsive with dark mode toggle, cart badge, user menu
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSun, FiMoon, FiShoppingCart, FiUser, FiLogOut,
  FiMenu, FiX, FiPackage, FiHeart, FiMapPin, FiShield, FiHome,
} from 'react-icons/fi';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import { selectCartCount, selectGiftCartCount } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/gifts', label: 'Gifts 🎁' },
  { to: '/celebrate', label: 'Celebrate ❤️' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((s) => s.theme);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const giftCartCount = useSelector(selectGiftCartCount);
  const totalCartCount = cartCount + giftCartCount;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out. See you soon! 👋');
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">❤️</span>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              BiteBond <span className="text-primary-500">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FiShoppingCart size={18} />
              {totalCartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none"
                >
                  {totalCartCount > 9 ? '9+' : totalCartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 card shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                      {[
                        { to: '/profile', icon: FiUser, label: 'My Profile' },
                        { to: '/orders', icon: FiPackage, label: 'My Orders' },
                        { to: '/profile#addresses', icon: FiMapPin, label: 'Addresses' },
                        { to: '/profile#contacts', icon: FiHeart, label: 'Family & Friends' },
                        ...(user?.role === 'admin' ? [{ to: '/admin', icon: FiShield, label: 'Admin Dashboard' }] : []),
                        ...(user?.role === 'restaurant_owner' && user?.managedRestaurantId
                          ? [{ to: `/restaurant-dashboard/${user.managedRestaurantId}`, icon: FiHome, label: 'Restaurant Dashboard' }]
                          : []),
                      ].map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Icon size={15} />
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <FiLogOut size={15} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 dark:text-gray-300'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-secondary text-center text-sm py-2">Login</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
