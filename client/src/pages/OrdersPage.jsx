/**
 * Orders Page — history with status badges and tracking
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  scheduled:        { label: 'Scheduled',           color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',        icon: '📅' },
  placed:           { label: 'Order Placed',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',    icon: '🕐' },
  accepted:         { label: 'Accepted',            color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', icon: '✅' },
  preparing:        { label: 'Preparing',           color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: '👨‍🍳' },
  out_for_delivery: { label: 'Out for Delivery',    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: '🛵' },
  delivered:        { label: 'Delivered',           color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: '🎉' },
  cancelled:        { label: 'Cancelled',           color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',        icon: '❌' },
};

const OrderCard = ({ order }) => {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={`/orders/${order._id}`}
        className="card-hover p-5 flex items-start gap-4 group block">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-2xl flex-shrink-0">
          {cfg.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
              {order.restaurantName}
            </h3>
            <FiChevronRight className="text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-primary-500 transition-colors" size={16} />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            {order.items.map((i) => `${i.name} ×${i.quantity}`).join(' · ')}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2.5">
            <span className={`badge text-xs px-2.5 py-1 ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FiClock size={11} /> {date}, {time}
            </span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-auto">
              ₹{order.total}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const FILTERS = [
    { val: 'all', label: 'All' },
    { val: 'placed', label: 'Active' },
    { val: 'delivered', label: 'Delivered' },
    { val: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = activeFilter !== 'all' ? { status: activeFilter } : {};
        const data = await orderService.getMyOrders(params);
        setOrders(data.data || []);
      } catch { toast.error('Failed to load orders'); }
      finally { setLoading(false); }
    };
    load();
  }, [activeFilter]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title mb-1 flex items-center gap-3">
          <FiPackage className="text-primary-500" /> My Orders
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Track and manage your orders</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-surface-dark-muted p-1 rounded-2xl mb-6 w-fit">
        {FILTERS.map(({ val, label }) => (
          <button key={val} onClick={() => setActiveFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFilter === val ? 'bg-white dark:bg-surface-dark-card text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="card p-5 flex gap-4">
              <div className="skeleton w-12 h-12 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-3 w-64 rounded" />
                <div className="skeleton h-5 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <span className="text-6xl mb-4 block">📦</span>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your order history will appear here</p>
          <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2">
            Order Now <FiArrowRight size={16} />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => <OrderCard key={o._id} order={o} />)}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
