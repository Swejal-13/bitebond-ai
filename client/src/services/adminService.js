import api from './api';

const adminService = {
  getOverview: async () => { const r = await api.get('/admin/overview'); return r.data.data; },
  getRevenueTrend: async (days = 14) => { const r = await api.get('/admin/revenue', { params: { days } }); return r.data.data.trend; },
  getAnalytics: async () => { const r = await api.get('/admin/analytics'); return r.data.data; },

  getUsers: async (params = {}) => { const r = await api.get('/admin/users', { params }); return r.data; },
  updateUser: async (id, data) => { const r = await api.put(`/admin/users/${id}`, data); return r.data.data; },

  getOrders: async (params = {}) => { const r = await api.get('/admin/orders', { params }); return r.data; },

  getRestaurants: async (params = {}) => { const r = await api.get('/admin/restaurants', { params }); return r.data; },
  updateRestaurant: async (id, data) => { const r = await api.put(`/admin/restaurants/${id}`, data); return r.data.data; },
};

export default adminService;
