import api from './api';

const giftService = {
  getGifts:      async (params = {}) => { const r = await api.get('/gifts', { params }); return r.data; },
  getFeatured:   async () => { const r = await api.get('/gifts/featured'); return r.data.data.gifts; },
  getCategories: async () => { const r = await api.get('/gifts/categories'); return r.data.data.categories; },
  getById:       async (id) => { const r = await api.get(`/gifts/${id}`); return r.data.data; },
};

export default giftService;
