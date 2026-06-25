/**
 * Gift Cart Page — review gift items, receiver address (remote gifting), checkout
 */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiTrash2, FiArrowRight, FiMapPin, FiUser, FiPhone, FiMessageCircle } from 'react-icons/fi';
import { updateGiftQuantity, removeGiftItem, clearGiftCart, selectGiftCartTotal, selectGiftCartCount } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const GiftCartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { giftItems } = useSelector((s) => s.cart);
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const giftTotal = useSelector(selectGiftCartTotal);
  const giftCount = useSelector(selectGiftCartCount);

  const [isSurprise, setIsSurprise] = useState(false);
  const [address, setAddress] = useState({ name: user?.name || '', phone: user?.phone || '', fullAddress: '', city: 'Pune' });
  const [placing, setPlacing] = useState(false);

  const deliveryFee = giftTotal >= 1000 ? 0 : 60;
  const total = giftTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) { toast.error('Please log in to send gifts'); return navigate('/login'); }
    if (!address.name || !address.phone || !address.fullAddress) return toast.error('Please fill in receiver details');
    setPlacing(true);
    // Note: Gift orders would integrate with a dedicated /api/gift-orders endpoint in production.
    setTimeout(() => {
      dispatch(clearGiftCart());
      toast.success('Gift order placed! 🎁❤️');
      setPlacing(false);
      navigate('/orders');
    }, 1200);
  };

  if (giftItems.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="text-7xl mb-6 block">🎁</span>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">Your gift cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Find the perfect gift to surprise someone special!</p>
        <Link to="/gifts" className="btn-primary inline-flex items-center gap-2">Browse Gifts <FiArrowRight size={16} /></Link>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="section-title mb-8 flex items-center gap-3">
        <FiGift className="text-primary-500" /> Gift Cart
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">{giftCount} item{giftCount > 1 ? 's' : ''}</h2>
              <button onClick={() => { dispatch(clearGiftCart()); toast('Gift cart cleared'); }}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                <FiTrash2 size={13} /> Clear all
              </button>
            </div>
            <AnimatePresence>
              {giftItems.map((item) => (
                <motion.div key={item.lineId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                  className="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.variantLabel}</p>
                    {item.personalization?.message && (
                      <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                        <FiMessageCircle size={11} /> "{item.personalization.message}"
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => dispatch(updateGiftQuantity({ lineId: item.lineId, quantity: item.quantity - 1 }))}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors">−</button>
                        <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => dispatch(updateGiftQuantity({ lineId: item.lineId, quantity: item.quantity + 1 }))}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors">+</button>
                      </div>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                  <button onClick={() => dispatch(removeGiftItem(item.lineId))} className="text-gray-300 hover:text-red-500 transition-colors self-start">
                    <FiTrash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Surprise mode */}
          <div className="card p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${isSurprise ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setIsSurprise(!isSurprise)}>
                <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${isSurprise ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">Surprise mode 🎉</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receiver won't be notified until the gift arrives at their door</p>
              </div>
            </label>
          </div>

          {/* Receiver address */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiMapPin className="text-primary-500" size={16} /> Receiver's Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Receiver Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} placeholder="Jane Doe" className="input pl-10 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="9876543210" className="input pl-10 text-sm" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Address</label>
                <textarea value={address.fullAddress} onChange={(e) => setAddress({ ...address, fullAddress: e.target.value })}
                  rows={2} placeholder="Flat/House no., Street, Area, City" className="input text-sm resize-none" />
              </div>
            </div>

            {user?.contacts?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or select from Family & Friends:</p>
                <div className="flex flex-wrap gap-2">
                  {user.contacts.map((c) => (
                    <button key={c._id} onClick={() => setAddress({ name: c.name, phone: c.phone, fullAddress: c.address || '', city: c.city || 'Pune' })}
                      className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 hover:text-primary-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                      ❤️ {c.name} ({c.relationship})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>₹{giftTotal}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery fee</span>
                <span>{deliveryFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                <span>Total</span><span className="text-primary-500">₹{total}</span>
              </div>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing}
              className="btn-primary w-full py-3.5 mt-5 flex items-center justify-center gap-2 text-base">
              {placing ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Placing order…</> : <>Send Gift · ₹{total} <FiArrowRight size={16} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCartPage;
