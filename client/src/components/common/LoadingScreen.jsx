import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white dark:bg-surface-dark flex flex-col items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-4"
    >
      {/* Animated logo mark */}
      <div className="relative w-16 h-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-500"
        />
        <div className="absolute inset-2 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl">
          ❤️
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">
        Connecting hearts through food…
      </p>
    </motion.div>
  </div>
);

export default LoadingScreen;
