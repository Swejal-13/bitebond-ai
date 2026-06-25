/**
 * Order Detail Page — status timeline, items, address, cancel
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiPhone, FiPackage, FiX } from 'react-icons/fi';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const ORDER_STEPS = [
  { key: 'placed',           label: 'Order Placed',    icon: '🕐', desc: 'Your order has been received' },
  { key: 'accepted',         label: 'Accepted',         icon: '✅', desc: 'Restaurant confirmed your order' },
  { key: 'preparing',        label: 'Preparing',        icon: '👨‍🍳', desc: 'Your food is being prepared' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', desc: 'Rider is on the way' },
  { key: 'delivered',        label: 'Delivered',        icon: '🎉', desc: 'Enjoy your meal!' },
];

const STATUS_INDEX = { scheduled: -2, placed: 0, accepted: 1, preparing: 2, out_for_delivery: 3, delivered: 4, cancelled: -1 };

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    orderService.getById(id)
      .then(({ order }) => setOrder(order))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Auto-refresh for active orders every 30s
  useEffect(() => {
    if (!order || ['delivered', 'cancelled'].includes(order?.status)) return;
    const interval = setInterval(async () => {
      try {
        const data = await orderService.getById(id);
        setOrder(data.order);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [order, id]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return toast.error('Please provide a cancellation reason');
    setCancelling(true);
    try {
      const { order: updated } = await orderService.cancel(id, cancelReason);
      setOrder(updated);
      toast.success('Order cancelled.');
      setShowCancelModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order.');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <div className="skeleton h-6 w-48 rounded" />
      <div className="skeleton h-48 rounded-2xl" />
      <div className="skeleton h-32 rounded-2xl" />
    </div>
  );

  if (!order) return null;

  const stepIdx = STATUS_INDEX[order.status];
  const isCancelled = order.status === 'cancelled';
  const isScheduledStatus = order.status === 'scheduled';
  const canCancel = ['scheduled', 'placed', 'accepted'].includes(order.status);
  const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">
      {/* Header */}
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6">
        <FiArrowLeft size={16} /> Back to Orders
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{order.restaurantName}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{orderDate} · #{order._id?.slice(-6).toUpperCase()}</p>
        </div>
        {canCancel && (
          <button onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-xl transition-colors">
            <FiX size={14} /> Cancel
          </button>
        )}
      </div>

      {/* Status tracker */}
      <div className="card p-6 mb-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <FiPackage size={16} className="text-primary-500" /> Order Status
        </h2>

        {order.status === 'scheduled' ? (
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
            <span className="text-3xl">📅</span>
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-400">Order Scheduled</p>
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
                Will be placed for delivery on {new Date(order.scheduledFor).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ) : isCancelled ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
            <span className="text-3xl">❌</span>
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
              {order.cancellationReason && (
                <p className="text-sm text-red-600/70 dark:text-red-400/70">{order.cancellationReason}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {ORDER_STEPS.map((step, i) => {
              const isCompleted = i <= stepIdx;
              const isActive = i === stepIdx;
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                      isCompleted ? 'bg-primary-500 shadow-glow-primary' : 'bg-gray-100 dark:bg-gray-800'
                    } ${isActive ? 'scale-110' : ''}`}>
                      {step.icon}
                    </div>
                    {i < ORDER_STEPS.length - 1 && (
                      <div className={`w-0.5 h-6 mt-1 rounded-full transition-colors duration-300 ${isCompleted && i < stepIdx ? 'bg-primary-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </div>
                  <div className="pb-4 pt-1.5">
                    <p className={`font-semibold text-sm ${isActive ? 'text-primary-500' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                      {step.label}
                    </p>
                    {(isActive || isCompleted) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {order.estimatedDelivery && !isCancelled && !isScheduledStatus && order.status !== 'delivered' && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-950/40 rounded-xl text-sm text-primary-700 dark:text-primary-300">
            🕐 Estimated delivery: <strong>{new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-500'}`} />
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">{item.name}</span>
                <span className="text-xs text-gray-400">×{item.quantity}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Bill breakdown */}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-2 text-sm">
          {[
            { l: 'Subtotal', v: `₹${order.subtotal}` },
            { l: 'Delivery fee', v: order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}` },
            { l: 'Taxes', v: `₹${order.taxes}` },
            ...(order.discount > 0 ? [{ l: 'Discount', v: `-₹${order.discount}` }] : []),
          ].map(({ l, v }) => (
            <div key={l} className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>{l}</span><span>{v}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <span>Total Paid</span><span className="text-primary-500">₹{order.total}</span>
          </div>
          {order.loyaltyPointsEarned > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">⭐ Earned {order.loyaltyPointsEarned} loyalty points</p>
          )}
        </div>
      </div>

      {/* Delivery address */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <FiMapPin size={15} className="text-primary-500" /> Delivery Address
        </h2>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.deliveryAddress.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{order.deliveryAddress.fullAddress}, {order.deliveryAddress.city}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
          <FiPhone size={12} /> {order.deliveryAddress.phone}
        </p>
        {order.isRemoteOrder && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge badge-primary text-xs">📍 Remote Order</span>
              {order.occasion && order.occasion !== 'none' && (
                <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs">
                  {{birthday:'🎂',anniversary:'💑',festival:'🎊',congratulations:'🎉',thank_you:'🙏',get_well_soon:'💙'}[order.occasion] || '❤️'} {order.occasion.replace('_',' ')}
                </span>
              )}
              {order.isSurpriseMode && <span className="badge bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 text-xs">🎉 Surprise Mode</span>}
              {order.isAnonymous && <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">🕵️ Anonymous</span>}
            </div>
            {!order.isAnonymous && order.senderName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From: <span className="font-medium text-gray-700 dark:text-gray-300">{order.senderName}</span></p>
            )}
            {order.personalMessage && (
              <div className="mt-2 p-3 bg-primary-50/50 dark:bg-primary-950/30 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Personal message</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{order.personalMessage}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="card w-full max-w-md p-6">
            <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">Cancel Order?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Please let us know why you're cancelling.</p>
            <div className="flex flex-col gap-2 mb-4">
              {['Changed my mind', 'Ordered by mistake', 'Delivery time too long', 'Other'].map((r) => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${cancelReason === r ? 'border-red-400 bg-red-50 dark:bg-red-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
                  <input type="radio" name="reason" value={r} checked={cancelReason === r} onChange={() => setCancelReason(r)} className="accent-red-500" />
                  <span className="text-sm text-gray-800 dark:text-gray-200">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="btn-secondary flex-1 py-2.5">Keep Order</button>
              <button onClick={handleCancel} disabled={cancelling || !cancelReason}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {cancelling ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
