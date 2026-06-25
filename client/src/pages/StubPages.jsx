/**
 * Stub Pages — will be fully implemented in subsequent phases
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiClock } from 'react-icons/fi';

const ComingSoonStub = ({ emoji, title, description, phase }) => (
  <div className="min-h-[60vh] flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <span className="text-6xl mb-6 block">{emoji}</span>
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-3">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{description}</p>
      <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
        <FiClock size={14} />
        Coming in {phase}
      </div>
      <div>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Back to Home <FiArrowRight size={15} />
        </Link>
      </div>
    </motion.div>
  </div>
);

export const RestaurantsPage = () => (
  <ComingSoonStub
    emoji="🍽️"
    title="Restaurant Listings"
    description="Browse hundreds of restaurants, filter by cuisine, rating, and delivery time. Powered by live restaurant APIs."
    phase="Phase 3"
  />
);

export const RestaurantDetailPage = () => (
  <ComingSoonStub
    emoji="🍕"
    title="Restaurant Menu"
    description="Full menu with food customization, add-to-cart, and special instructions."
    phase="Phase 3"
  />
);

export const CartPage = () => (
  <ComingSoonStub
    emoji="🛒"
    title="Your Cart"
    description="Review your order, apply coupons, choose delivery address, and checkout."
    phase="Phase 4"
  />
);

export const OrdersPage = () => (
  <ComingSoonStub
    emoji="📦"
    title="My Orders"
    description="Track active orders in real time and browse your order history."
    phase="Phase 4"
  />
);

export const GiftPage = () => (
  <ComingSoonStub
    emoji="🎁"
    title="Gift Marketplace"
    description="Browse cakes, flowers, chocolates, personalized gifts, and hampers for every occasion."
    phase="Phase 5"
  />
);
