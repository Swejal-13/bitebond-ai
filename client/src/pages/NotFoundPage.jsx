import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <p className="text-8xl font-display font-bold text-gray-100 dark:text-gray-800 select-none">404</p>
      <span className="text-5xl -mt-6 mb-4 block relative">🍽️</span>
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Looks like this page went out for delivery and never came back.
      </p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <FiArrowLeft size={16} /> Back to Home
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
