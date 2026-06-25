/**
 * Restaurant Dashboard — for restaurant_owner role
 * Overview KPIs, menu management, orders, simple analytics
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FiShoppingBag, FiDollarSign, FiStar, FiClock, FiPower } from 'react-icons/fi';
import restaurantDashboardService from '../../services/restaurantDashboardService';
import RestaurantMenuTab from './RestaurantMenuTab';
import RestaurantOrdersTab from './RestaurantOrdersTab';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'menu', label: 'Menu' },
  { key: 'orders', label: 'Orders' },
];

const RestaurantDashboardPage = () => {
  const { restaurantId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, an] = await Promise.all([
          restaurantDashboardService.getOverview(restaurantId),
          restaurantDashboardService.getAnalytics(restaurantId),
        ]);
        setOverview(ov);
        setAnalytics(an);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, [restaurantId]);

  const handleToggleOpen = async () => {
    setToggling(true);
    try {
      const { restaurant } = await restaurantDashboardService.toggleOpen(restaurantId);
      setOverview((prev) => ({ ...prev, restaurant }));
      toast.success(`Restaurant is now ${restaurant.isOpen ? 'open' : 'closed'}`);
    } catch { toast.error('Failed to toggle status'); }
    finally { setToggling(false); }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      <div className="skeleton h-8 w-64 rounded" />
      <div className="grid sm:grid-cols-3 gap-4">{[1,2,3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
    </div>
  );

  if (!overview) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="section-title mb-1">{overview.restaurant.name} 🍽️</h1>
          <p className="text-gray-500 dark:text-gray-400">Restaurant Dashboard</p>
        </div>
        <button onClick={handleToggleOpen} disabled={toggling}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            overview.restaurant.isOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
          <FiPower size={15} /> {overview.restaurant.isOpen ? 'Open' : 'Closed'}
        </button>
      </motion.div>

      <div className="flex gap-1 bg-gray-100 dark:bg-surface-dark-muted p-1 rounded-2xl mb-6 w-fit">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === key ? 'bg-white dark:bg-surface-dark-card text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: FiShoppingBag, label: 'Total Orders', value: overview.stats.totalOrders, color: 'bg-purple-500' },
              { icon: FiClock, label: 'Orders Today', value: overview.stats.ordersToday, color: 'bg-blue-500' },
              { icon: FiDollarSign, label: 'Total Revenue', value: `₹${overview.stats.totalRevenue.toLocaleString('en-IN')}`, color: 'bg-green-500' },
              { icon: FiStar, label: 'Rating', value: `${overview.stats.rating?.toFixed(1)} (${overview.stats.ratingCount})`, color: 'bg-amber-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {analytics?.revenueTrend?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue — Last 14 Days</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={analytics.revenueTrend.map((t) => ({ ...t, date: new Date(t._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {analytics?.topItems?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Selling Items</h3>
              <div className="space-y-2">
                {analytics.topItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item._id}</span>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{item.count} sold</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">₹{item.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'menu' && <RestaurantMenuTab restaurantId={restaurantId} />}
      {activeTab === 'orders' && <RestaurantOrdersTab restaurantId={restaurantId} />}
    </div>
  );
};

export default RestaurantDashboardPage;
