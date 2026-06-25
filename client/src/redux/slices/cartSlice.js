/**
 * Cart Slice — Phase 5: supports both food items (restaurant cart) and gift items (separate gift cart)
 */
import { createSlice } from '@reduxjs/toolkit';

const loadCart = (key, fallback) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
};
const saveCart = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };

const initialState = {
  // Food cart (tied to one restaurant)
  ...loadCart('bb_cart', { items: [], restaurantId: null, restaurantName: '' }),
  // Gift cart (independent — gifts can be mixed across categories)
  giftItems: loadCart('bb_gift_cart', { items: [] }).items || [],
  isOpen: false,
};

const persistFoodCart = (state) => saveCart('bb_cart', { items: state.items, restaurantId: state.restaurantId, restaurantName: state.restaurantName });
const persistGiftCart = (state) => saveCart('bb_gift_cart', { items: state.giftItems });

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // ── Food cart ──────────────────────────────────────────────────────────
    addItem: (state, action) => {
      const { item, restaurantId, restaurantName } = action.payload;
      if (state.restaurantId && state.restaurantId !== restaurantId) state.items = [];
      state.restaurantId = restaurantId; state.restaurantName = restaurantName;
      const existing = state.items.find((i) => i._id === item._id);
      if (existing) existing.quantity += 1; else state.items.push({ ...item, quantity: 1 });
      persistFoodCart(state);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      if (state.items.length === 0) { state.restaurantId = null; state.restaurantName = ''; }
      persistFoodCart(state);
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i._id !== itemId);
        if (state.items.length === 0) { state.restaurantId = null; state.restaurantName = ''; }
      } else {
        const item = state.items.find((i) => i._id === itemId);
        if (item) item.quantity = quantity;
      }
      persistFoodCart(state);
    },
    clearCart: (state) => {
      state.items = []; state.restaurantId = null; state.restaurantName = '';
      localStorage.removeItem('bb_cart');
    },

    // ── Gift cart ──────────────────────────────────────────────────────────
    addGiftItem: (state, action) => {
      // payload: { giftId, name, image, variantLabel, price, quantity, personalization: { message, photoUrl } }
      const newItem = action.payload;
      const lineId = `${newItem.giftId}-${newItem.variantLabel}-${newItem.personalization?.message || ''}`;
      const existing = state.giftItems.find((i) => i.lineId === lineId);
      if (existing) existing.quantity += newItem.quantity || 1;
      else state.giftItems.push({ ...newItem, lineId, quantity: newItem.quantity || 1 });
      persistGiftCart(state);
    },
    removeGiftItem: (state, action) => {
      state.giftItems = state.giftItems.filter((i) => i.lineId !== action.payload);
      persistGiftCart(state);
    },
    updateGiftQuantity: (state, action) => {
      const { lineId, quantity } = action.payload;
      if (quantity <= 0) state.giftItems = state.giftItems.filter((i) => i.lineId !== lineId);
      else { const item = state.giftItems.find((i) => i.lineId === lineId); if (item) item.quantity = quantity; }
      persistGiftCart(state);
    },
    clearGiftCart: (state) => { state.giftItems = []; localStorage.removeItem('bb_gift_cart'); },

    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
  },
});

// ── Selectors: food cart ──────────────────────────────────────────────────────
export const selectCartTotal = (state) => state.cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
export const selectCartCount = (state) => state.cart.items.reduce((s, i) => s + i.quantity, 0);
export const selectCartItem = (itemId) => (state) => state.cart.items.find((i) => i._id === itemId);

// ── Selectors: gift cart ──────────────────────────────────────────────────────
export const selectGiftCartTotal = (state) => state.cart.giftItems.reduce((s, i) => s + i.price * i.quantity, 0);
export const selectGiftCartCount = (state) => state.cart.giftItems.reduce((s, i) => s + i.quantity, 0);

export const {
  addItem, removeItem, updateQuantity, clearCart,
  addGiftItem, removeGiftItem, updateGiftQuantity, clearGiftCart,
  toggleCart, openCart, closeCart,
} = cartSlice.actions;
export default cartSlice.reducer;
