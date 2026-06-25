import React, { useState, useEffect } from 'react';
import restaurantDashboardService from '../../services/restaurantDashboardService';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
const NEXT_ACTION = {
  placed: { next: 'accepted', label: 'Accept Order' },
  accepted: { next: 'preparing', label: 'Start Preparing' },
  preparing: { next: 'out_for_delivery', label: 'Send for Delivery' },
  out_for_delivery: { next: 'delivered', label: 'Mark Delivered' },
};

const STATUS_COLORS = {
  scheduled: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  placed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  accepted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  out_for_delivery: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const RestaurantOrdersTab = ({ restaurantId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await restaurantDashboardService.getOrders(restaurantId, { limit: 20 });
      setOrders(data.data || []);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [restaurantId]);

  const advanceStatus = async (order) => {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setUpdating(order._id);
    try {
      const data = await restaurantDashboardService.updateOrderStatus(restaurantId, order._id, action.next);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data.order : o)));
      toast.success(`Order moved to "${action.next.replace('_', ' ')}"`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Incoming Orders</h3>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const action = NEXT_ACTION[o.status];
            return (
              <div key={o._id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{o.user?.name} · {o.user?.phone}</p>
                  </div>
                  <span className={`badge text-xs ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {o.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">₹{o.total}</span>
                  {action && (
                    <button onClick={() => advanceStatus(o)} disabled={updating === o._id}
                      className="btn-primary text-xs py-1.5 px-3">
                      {updating === o._id ? 'Updating…' : action.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders yet</p>}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrdersTab;
