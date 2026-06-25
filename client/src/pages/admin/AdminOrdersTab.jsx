import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  scheduled: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  placed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  accepted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  out_for_delivery: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const AdminOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = statusFilter ? { status: statusFilter, limit: 20 } : { limit: 20 };
        const data = await adminService.getOrders(params);
        setOrders(data.data || []);
      } catch { toast.error('Failed to load orders'); }
      finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">All Orders</h3>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input text-sm py-2 max-w-[180px] cursor-pointer">
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="py-2 pr-4 font-medium">Order</th>
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Total</th>
                <th className="py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900 dark:text-white">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{o.restaurantName || 'Gift order'}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-gray-700 dark:text-gray-300">{o.user?.name}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="py-3 pr-4 capitalize text-gray-600 dark:text-gray-400">{o.orderType}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge text-xs ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">₹{o.total}</td>
                  <td className="py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders found</p>}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersTab;
