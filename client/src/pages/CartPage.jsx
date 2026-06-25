/**
 * Cart Page — Phase 6: remote ordering + occasion + scheduled delivery
 */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiMapPin, FiUser, FiPhone, FiArrowRight, FiTag, FiCalendar, FiClock } from 'react-icons/fi';
import { updateQuantity, removeItem, clearCart, selectCartTotal, selectCartCount } from '../redux/slices/cartSlice';
import { OCCASIONS } from '../utils/occasions';
import AIWishGenerator from '../components/ai/AIWishGenerator';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';

const TAX_RATE = 0.05;

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, restaurantName, restaurantId } = useSelector((s) => s.cart);
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const cartTotal = useSelector(selectCartTotal);
  const cartCount = useSelector(selectCartCount);

  // Pre-fill remote intent from Occasion Planner (sessionStorage)
  const [isRemote, setIsRemote] = useState(() => sessionStorage.getItem('bb_remote_intent') === 'true');
  const [occasion, setOccasion] = useState(() => sessionStorage.getItem('bb_occasion') || 'none');
  const [isSurprise, setIsSurprise] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [senderName, setSenderName] = useState(user?.name || '');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState({
    name: user?.name || '', phone: user?.phone || '',
    fullAddress: '', city: 'Pune', state: 'Maharashtra', pincode: '', landmark: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [usePoints, setUsePoints] = useState(false);

  // Clear the planner intent flag once consumed
  useEffect(() => {
    return () => sessionStorage.removeItem('bb_remote_intent');
  }, []);

  const deliveryFee = cartTotal >= 500 ? 0 : 40;
  const pointsDiscount = usePoints ? Math.min(user?.loyaltyPoints || 0, cartTotal * 0.1) : 0;
  const taxes = Math.round((cartTotal - pointsDiscount) * TAX_RATE);
  const total = cartTotal + deliveryFee + taxes - pointsDiscount;
  const pointsToEarn = Math.floor(total / 10);

  const handleAddrChange = (field, val) => setDeliveryAddress((p) => ({ ...p, [field]: val }));

  const minDate = new Date().toISOString().split('T')[0];

  const handleCheckout = async () => {
    if (!isAuthenticated) { toast.error('Please log in to place an order'); return navigate('/login'); }
    if (!deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.fullAddress) {
      return toast.error('Please fill in the delivery address');
    }
    if (deliveryAddress.phone.length !== 10) return toast.error('Enter a valid 10-digit phone number');

    let scheduledFor = null;
    if (isScheduled) {
      if (!scheduleDate || !scheduleTime) return toast.error('Please pick a delivery date and time');
      scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      if (new Date(scheduledFor) <= new Date()) return toast.error('Scheduled time must be in the future');
    }

    setPlacing(true);
    try {
      const payload = {
        orderType: 'food',
        restaurantId,
        items: items.map((i) => ({ foodId: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        deliveryAddress,
        isRemoteOrder: isRemote,
        isSurpriseMode: isSurprise,
        isAnonymous,
        senderName: isAnonymous ? '' : senderName,
        occasion: isRemote ? occasion : 'none',
        scheduledFor,
        personalMessage,
        paymentMethod,
        loyaltyPointsToUse: usePoints ? Math.floor(pointsDiscount) : 0,
      };
      const { order } = await orderService.placeOrder(payload);
      dispatch(clearCart());
      sessionStorage.removeItem('bb_occasion');
      sessionStorage.removeItem('bb_send_mode');
      toast.success(isScheduled ? 'Order scheduled! 📅' : 'Order placed! 🎉');
      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally { setPlacing(false); }
  };

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="text-7xl mb-6 block">🛒</span>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Add some delicious food to get started!</p>
        <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2">
          Browse Restaurants <FiArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );

  const InputField = ({ icon: Icon, label, field, type = 'text', placeholder, required }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input type={type} value={deliveryAddress[field]} onChange={(e) => handleAddrChange(field, e.target.value)}
          placeholder={placeholder} className="input pl-10 text-sm" required={required} />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="section-title mb-8 flex items-center gap-3">
        <FiShoppingCart className="text-primary-500" /> Your Cart
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Items + Address */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cart items */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {restaurantName} <span className="text-gray-400 text-sm font-normal">({cartCount} items)</span>
              </h2>
              <button onClick={() => { dispatch(clearCart()); toast('Cart cleared'); }}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                <FiTrash2 size={13} /> Clear all
              </button>
            </div>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div key={item._id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                    <p className="text-primary-500 font-semibold text-sm">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity - 1 }))}
                      className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-500 transition-colors">
                      <FiMinus size={13} />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ itemId: item._id, quantity: item.quantity + 1 }))}
                      className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-500 transition-colors">
                      <FiPlus size={13} />
                    </button>
                    <span className="w-16 text-right font-semibold text-sm text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Remote ordering toggle */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Who is this order for?</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { val: false, label: '🙋 Myself', desc: 'Deliver to my address' },
                { val: true, label: '❤️ Someone Else', desc: 'Remote ordering' },
              ].map(({ val, label, desc }) => (
                <button key={String(val)} onClick={() => setIsRemote(val)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${isRemote === val ? 'border-primary-400 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>

            {isRemote && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">

                {/* Occasion picker */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What's the occasion?</p>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((o) => (
                      <button key={o.key} onClick={() => setOccasion(o.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          occasion === o.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                        {o.emoji} {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Personal message (optional)</label>
                    <AIWishGenerator
                      recipientName={deliveryAddress.name}
                      onInsert={(wish) => setPersonalMessage(wish.slice(0, 200))}
                    />
                  </div>
                  <textarea value={personalMessage} onChange={(e) => setPersonalMessage(e.target.value.slice(0, 200))}
                    placeholder="Write a heartfelt note to include with the order…" rows={2} className="input text-sm resize-none" />
                  <p className="text-xs text-gray-400 mt-1 text-right">{personalMessage.length}/200</p>
                </div>

                {/* Toggles */}
                {[
                  { label: 'Surprise mode 🎉', desc: "Receiver won't see order details until delivered", val: isSurprise, set: setIsSurprise },
                  { label: 'Anonymous sender 🕵️', desc: "Your name won't be shared with receiver", val: isAnonymous, set: setIsAnonymous },
                ].map(({ label, desc, val, set }) => (
                  <label key={label} className="flex items-start gap-3 cursor-pointer">
                    <div className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${val ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                      onClick={() => set(!val)}>
                      <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${val ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                    </div>
                  </label>
                ))}

                {!isAnonymous && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your name (shown to receiver)</label>
                    <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your name" className="input text-sm" />
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Scheduled delivery */}
          <div className="card p-5">
            <label className="flex items-start gap-3 cursor-pointer mb-2">
              <div className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${isScheduled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setIsScheduled(!isScheduled)}>
                <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${isScheduled ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1.5"><FiCalendar size={14} /> Schedule delivery</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pick a future date & time instead of delivering now</p>
              </div>
            </label>

            {isScheduled && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="date" min={minDate} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="input pl-9 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Time</label>
                  <div className="relative">
                    <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="input pl-9 text-sm" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Delivery address */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiMapPin className="text-primary-500" size={16} />
              {isRemote ? "Receiver's Delivery Address" : 'Delivery Address'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField icon={FiUser} label="Full Name" field="name" placeholder="John Doe" required />
              <InputField icon={FiPhone} label="Phone" field="phone" type="tel" placeholder="9876543210" required />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Address</label>
                <textarea value={deliveryAddress.fullAddress} onChange={(e) => handleAddrChange('fullAddress', e.target.value)}
                  placeholder="Flat/House no., Street, Area" rows={2} className="input text-sm resize-none" required />
              </div>
              <InputField icon={FiMapPin} label="City" field="city" placeholder="Pune" required />
              <InputField icon={FiMapPin} label="Pincode" field="pincode" placeholder="411001" />
              <div className="sm:col-span-2">
                <InputField icon={FiMapPin} label="Landmark (optional)" field="landmark" placeholder="Near XYZ landmark" />
              </div>
            </div>

            {isRemote && user?.contacts?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or select from Family & Friends:</p>
                <div className="flex flex-wrap gap-2">
                  {user.contacts.map((c) => (
                    <button key={c._id} onClick={() => setDeliveryAddress({
                      name: c.name, phone: c.phone, fullAddress: c.address || '', city: c.city || 'Pune', state: 'Maharashtra', pincode: '', landmark: '',
                    })} className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                      ❤️ {c.name} ({c.relationship})
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isRemote && user?.addresses?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or select a saved address:</p>
                <div className="flex flex-wrap gap-2">
                  {user.addresses.map((addr) => (
                    <button key={addr._id} onClick={() => setDeliveryAddress({
                      name: user.name, phone: user.phone || '',
                      fullAddress: addr.fullAddress, city: addr.city,
                      state: addr.state, pincode: addr.pincode, landmark: addr.landmark || '',
                    })} className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                      📍 {addr.label} — {addr.city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>
            <div className="flex flex-col gap-2">
              {[
                { val: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                { val: 'online', label: '💳 Online Payment', desc: 'UPI, cards, net banking (coming soon)' },
              ].map(({ val, label, desc }) => (
                <label key={val} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === val ? 'border-primary-400 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700'}`}>
                  <input type="radio" name="payment" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} className="accent-primary-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

            {isRemote && (
              <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-950/40 rounded-xl text-sm text-primary-700 dark:text-primary-300 flex items-center gap-2">
                {OCCASIONS.find((o) => o.key === occasion)?.emoji || '❤️'} Sending for {OCCASIONS.find((o) => o.key === occasion)?.label || 'a special occasion'}
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              {[
                { label: `Subtotal (${cartCount} items)`, val: `₹${cartTotal}` },
                { label: 'Delivery fee', val: deliveryFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₹${deliveryFee}` },
                { label: 'Taxes & fees (5%)', val: `₹${taxes}` },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{label}</span><span>{val}</span>
                </div>
              ))}

              {(user?.loyaltyPoints || 0) > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} className="accent-primary-500 rounded" />
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">Use loyalty points</p>
                        <p className="text-xs text-gray-400">{user?.loyaltyPoints} pts available</p>
                      </div>
                    </div>
                    {usePoints && <span className="text-green-600 font-semibold">-₹{Math.floor(pointsDiscount)}</span>}
                  </label>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="text-primary-500">₹{Math.round(total)}</span>
              </div>
            </div>

            {deliveryFee === 0 && <p className="text-xs text-green-600 dark:text-green-400 mt-2">🎉 Free delivery on orders above ₹500!</p>}
            {deliveryFee > 0 && <p className="text-xs text-gray-400 mt-2">Add ₹{500 - cartTotal} more for free delivery</p>}

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <FiTag size={13} /> You'll earn <strong>{pointsToEarn} loyalty points</strong> on this order!
            </div>

            <button onClick={handleCheckout} disabled={placing}
              className="btn-primary w-full py-3.5 mt-5 flex items-center justify-center gap-2 text-base">
              {placing
                ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Placing order…</>
                : <>{isScheduled ? 'Schedule Order' : 'Place Order'} · ₹{Math.round(total)} <FiArrowRight size={16} /></>}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              By placing this order, you agree to our <a href="#" className="text-primary-500 hover:underline">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
