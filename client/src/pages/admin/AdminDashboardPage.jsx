/**
 * Admin Dashboard — overview KPIs, revenue chart, users/orders/restaurants tabs
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { FiUsers, FiShoppingBag, FiDollarSign, FiHome, FiTrendingUp } from 'react-icons/fi';
import adminService from '../../services/adminService';
import AdminUsersTab from './AdminUsersTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminRestaurantsTab from './AdminRestaurantsTab';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'overview', label: 'Overview', icon: FiTrendingUp },
  { key: 'users', label: 'Users', icon: FiUsers },
  { key: 'orders', label: 'Orders', icon: FiShoppingBag },
  { key: 'restaurants', label: 'Restaurants', icon: FiHome },
];

const COLORS = ['#f43f5e', '#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const KpiCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    {sub && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, trend, an] = await Promise.all([
          adminService.getOverview(),
          adminService.getRevenueTrend(14),
          adminService.getAnalytics(),
        ]);
        setOverview(ov);
        setRevenueTrend(trend.map((t) => ({ ...t, date: new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) })));
        setAnalytics(an);
      } catch { toast.error('Failed to load dashboard data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title mb-1">Admin Dashboard 📊</h1>
        <p className="text-gray-500 dark:text-gray-400">Platform-wide insights and management</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-surface-dark-muted p-1 rounded-2xl mb-6 w-fit overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === key ? 'bg-white dark:bg-surface-dark-card text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
            </div>
          ) : overview && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KpiCard icon={FiUsers} label="Total Users" value={overview.users.total} sub={`+${overview.users.newToday} today`} color="bg-blue-500" />
                <KpiCard icon={FiShoppingBag} label="Total Orders" value={overview.orders.total} sub={`${overview.orders.pending} pending`} color="bg-purple-500" />
                <KpiCard icon={FiHome} label="Restaurants" value={overview.restaurants.total} sub={`${overview.restaurants.active} active`} color="bg-amber-500" />
                <KpiCard icon={FiDollarSign} label="Total Revenue" value={`₹${overview.revenue.total.toLocaleString('en-IN')}`} sub={`₹${overview.revenue.thisMonth.toLocaleString('en-IN')} this month`} color="bg-green-500" />
              </div>

              {/* Revenue trend chart */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue — Last 14 Days</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} name="Revenue (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Order type + status breakdown */}
              {analytics && (
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="card p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Type Breakdown</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={analytics.orderTypeBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80}
                          label={({ _id, count }) => `${_id}: ${count}`}>
                          {analytics.orderTypeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Restaurants</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analytics.topRestaurants} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="orderCount" fill="#f97316" radius={[0, 6, 6, 0]} name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'users' && <AdminUsersTab />}
      {activeTab === 'orders' && <AdminOrdersTab />}
      {activeTab === 'restaurants' && <AdminRestaurantsTab />}
    </div>
  );
};

export default AdminDashboardPage;
