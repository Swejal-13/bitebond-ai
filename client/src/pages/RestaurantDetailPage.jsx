/**
 * Restaurant Detail Page — banner, info, menu grouped by category, add to cart
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiStar, FiClock, FiTruck, FiArrowLeft, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { addItem, removeItem, updateQuantity, selectCartItem, selectCartCount } from '../redux/slices/cartSlice';
import restaurantService from '../services/restaurantService';
import toast from 'react-hot-toast';

const MenuItemCard = ({ item, restaurantId, restaurantName }) => {
  const dispatch = useDispatch();
  const cartItem = useSelector(selectCartItem(item._id));
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    dispatch(addItem({ item: { ...item, restaurantId }, restaurantId, restaurantName }));
    toast.success(`${item.name} added to cart!`, { icon: '🛒' });
  };
  const handleInc = () => dispatch(updateQuantity({ itemId: item._id, quantity: qty + 1 }));
  const handleDec = () => {
    if (qty === 1) { dispatch(removeItem(item._id)); toast(`${item.name} removed`, { icon: '🗑️' }); }
    else dispatch(updateQuantity({ itemId: item._id, quantity: qty - 1 }));
  };

  return (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span className={`flex-shrink-0 w-4 h-4 rounded-sm border-2 mt-0.5 ${item.isVeg ? 'border-green-600' : 'border-red-500'}`}>
            <span className={`block w-2 h-2 rounded-full mx-auto mt-0.5 ${item.isVeg ? 'bg-green-600' : 'bg-red-500'}`} />
          </span>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{item.name}</h4>
        </div>
        {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-gray-900 dark:text-white">₹{item.price}</span>
          {qty === 0 ? (
            <button onClick={handleAdd}
              className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm">
              <FiPlus size={13} /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-primary-500 rounded-xl overflow-hidden shadow-sm">
              <button onClick={handleDec} className="w-8 h-8 flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                <FiMinus size={13} />
              </button>
              <span className="text-white font-bold text-sm min-w-[20px] text-center">{qty}</span>
              <button onClick={handleInc} className="w-8 h-8 flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                <FiPlus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const cartCount = useSelector(selectCartCount);
  const catRefs = useRef({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, m] = await Promise.all([
          restaurantService.getById(id),
          restaurantService.getMenu(id),
        ]);
        setRestaurant(r.restaurant);
        setMenuData(m);
        if (m?.categories?.length > 0) setActiveCategory(m.categories[0].name);
      } catch {
        toast.error('Restaurant not found');
        navigate('/restaurants');
      } finally { setLoading(false); }
    };
    load();
  }, [id, navigate]);

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    catRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="skeleton h-64 rounded-2xl" />
      <div className="skeleton h-8 w-64 rounded-xl" />
      <div className="skeleton h-4 w-48 rounded" />
    </div>
  );

  if (!restaurant) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors py-4">
        <FiArrowLeft size={16} /> Back to restaurants
      </button>

      {/* Banner */}
      <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-6">
        {(restaurant.banner || restaurant.image) && (
          <img src={restaurant.banner || restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">{restaurant.name}</h1>
          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine?.map((c) => (
              <span key={c} className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">{c}</span>
            ))}
          </div>
        </div>
        {!restaurant.isOpen && (
          <div className="absolute top-4 right-4 bg-gray-900/80 text-white text-sm font-semibold px-3 py-1.5 rounded-xl backdrop-blur-sm">
            Currently Closed
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-xl">
          <FiStar className="text-green-600" size={14} fill="currentColor" />
          <span className="font-bold text-green-700 dark:text-green-400">{restaurant.rating?.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({restaurant.ratingCount})</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
          <FiClock size={14} /> {restaurant.deliveryTime} min
        </div>
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
          <FiTruck size={14} />
          {restaurant.deliveryFee === 0 ? <span className="text-green-600 font-semibold">Free delivery</span> : `₹${restaurant.deliveryFee} delivery`}
        </div>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Min order: <span className="font-semibold text-gray-700 dark:text-gray-300">₹{restaurant.minOrder}</span>
        </div>
      </div>

      {/* Menu */}
      {menuData && (
        <div className="flex gap-6">
          {/* Category sidebar */}
          <div className="hidden md:block w-48 flex-shrink-0 sticky top-20 self-start">
            <div className="card p-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Menu</p>
              {menuData.categories.map(({ name }) => (
                <button key={name} onClick={() => scrollToCategory(name)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === name ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu items */}
          <div className="flex-1 space-y-8">
            {menuData.categories.map(({ name, items }) => (
              <div key={name} ref={(el) => (catRefs.current[name] = el)}>
                <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                  {name} <span className="text-sm text-gray-400 font-normal">({items.length})</span>
                </h2>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => (
                    <MenuItemCard key={item._id} item={item} restaurantId={id} restaurantName={restaurant.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating cart button */}
      {cartCount > 0 && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => navigate('/cart')}
            className="flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-glow-primary transition-all active:scale-95">
            <FiShoppingCart size={20} />
            View Cart ({cartCount} item{cartCount > 1 ? 's' : ''})
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
