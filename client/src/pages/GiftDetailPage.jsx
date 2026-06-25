/**
 * Gift Detail Page
 * Image gallery + variant selector + personalization (text/photo) + add to cart
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiStar, FiClock, FiEdit3, FiUpload, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { addGiftItem, selectGiftCartCount } from '../redux/slices/cartSlice';
import giftService from '../services/giftService';
import GiftCard from '../components/gift/GiftCard';
import AIWishGenerator from '../components/ai/AIWishGenerator';
import toast from 'react-hot-toast';

const CAT_LABELS = {
  cake: 'Cake', flowers: 'Flowers', chocolates: 'Chocolates',
  personalized: 'Personalized Gift', greeting_card: 'Greeting Card', hamper: 'Hamper',
};

const GiftDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const giftCartCount = useSelector(selectGiftCartCount);

  const [gift, setGift] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await giftService.getById(id);
        setGift(data.gift);
        setRelated(data.related || []);
        setSelectedVariant(data.gift.variants?.[0] || null);
      } catch {
        toast.error('Gift not found');
        navigate('/gifts');
      } finally { setLoading(false); }
    };
    load();
  }, [id, navigate]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB');
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const price = selectedVariant?.price ?? gift?.basePrice ?? 0;
  const maxLen = gift?.personalizationOptions?.maxTextLen || 50;

  const handleAddToCart = () => {
    if (gift.isPersonalizable && gift.personalizationOptions?.allowText && !message.trim()) {
      return toast.error(`Please add a ${gift.personalizationOptions.textLabel?.toLowerCase() || 'message'}`);
    }
    dispatch(addGiftItem({
      giftId: gift._id,
      name: gift.name,
      image: gift.images?.[0] || '',
      category: gift.category,
      variantLabel: selectedVariant?.label || 'Standard',
      price,
      quantity,
      personalization: {
        message: message.trim(),
        // In production: photoFile would be uploaded to Cloudinary here; storing preview for demo
        photoUrl: photoPreview || '',
      },
    }));
    setAdded(true);
    toast.success(`${gift.name} added to cart! 🎁`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="skeleton h-96 rounded-2xl" />
      <div className="space-y-4">
        <div className="skeleton h-8 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    </div>
  );

  if (!gift) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6">
        <FiArrowLeft size={16} /> Back to gifts
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
            {gift.images?.[activeImage] ? (
              <img src={gift.images[activeImage]} alt={gift.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">🎁</div>
            )}
          </div>
          {gift.images?.length > 1 && (
            <div className="flex gap-2">
              {gift.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-primary-400' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="badge badge-primary mb-3">{CAT_LABELS[gift.category]}</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">{gift.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            {gift.rating > 0 && (
              <div className="flex items-center gap-1">
                <FiStar className="text-amber-400" size={15} fill="currentColor" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">{gift.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({gift.ratingCount} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <FiClock size={13} /> {gift.deliveryTime >= 1440 ? `${Math.round(gift.deliveryTime / 1440)} day delivery` : `${gift.deliveryTime} min delivery`}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{gift.description}</p>

          {/* Variants */}
          {gift.variants?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select size/option</p>
              <div className="flex flex-wrap gap-2">
                {gift.variants.map((v) => (
                  <button key={v._id} onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedVariant?._id === v._id ? 'border-primary-400 bg-primary-50 dark:bg-primary-950 text-primary-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {v.label} · ₹{v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Personalization */}
          {gift.isPersonalizable && (
            <div className="card p-4 mb-6 bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiEdit3 className="text-purple-500" size={15} /> Personalize this gift
              </h3>

              {gift.personalizationOptions?.allowText && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {gift.personalizationOptions.textLabel || 'Custom message'}
                    </label>
                    <AIWishGenerator onInsert={(wish) => setMessage(wish.slice(0, maxLen))} />
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, maxLen))}
                    placeholder="Write something heartfelt…"
                    rows={2}
                    className="input text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/{maxLen}</p>
                </div>
              )}

              {gift.personalizationOptions?.allowPhoto && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Upload photo</label>
                  {photoPreview ? (
                    <div className="relative w-24 h-24">
                      <img src={photoPreview} alt="preview" className="w-24 h-24 rounded-xl object-cover" />
                      <button onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 w-fit px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:border-purple-300 transition-colors">
                      <FiUpload size={14} /> Choose photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quantity + price */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="text-gray-600 dark:text-gray-300 font-bold w-6">−</button>
              <span className="font-semibold text-gray-900 dark:text-white w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="text-gray-600 dark:text-gray-300 font-bold w-6">+</button>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{price * quantity}</span>
          </div>

          <button onClick={handleAddToCart}
            className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              added ? 'bg-green-500 text-white' : 'btn-primary'}`}>
            {added ? <><FiCheck size={18} /> Added to Cart!</> : <><FiShoppingCart size={18} /> Add to Gift Cart</>}
          </button>
        </div>
      </div>

      {/* Related gifts */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-5">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {related.map((g, i) => <GiftCard key={g._id} gift={g} index={i} />)}
          </div>
        </div>
      )}

      {/* Floating gift cart button */}
      {giftCartCount > 0 && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => navigate('/gift-cart')}
            className="flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-glow-primary transition-all active:scale-95">
            <FiShoppingCart size={20} />
            View Gift Cart ({giftCartCount})
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default GiftDetailPage;
