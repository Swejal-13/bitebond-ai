import api from './api';

const restaurantDashboardService = {
  getOverview: async (restaurantId) => {
    const r = await api.get(`/restaurant-dashboard/${restaurantId}/overview`);
    return r.data.data;
  },
  getAnalytics: async (restaurantId) => {
    const r = await api.get(`/restaurant-dashboard/${restaurantId}/analytics`);
    return r.data.data;
  },
  getOrders: async (restaurantId, params = {}) => {
    const r = await api.get(`/restaurant-dashboard/${restaurantId}/orders`, { params });
    return r.data;
  },
  updateOrderStatus: async (restaurantId, orderId, status) => {
    const r = await api.put(`/restaurant-dashboard/${restaurantId}/orders/${orderId}/status`, { status });
    return r.data.data;
  },
  getMenu: async (restaurantId) => {
    const r = await api.get(`/restaurant-dashboard/${restaurantId}/menu`);
    return r.data.data;
  },
  addMenuItem: async (restaurantId, item) => {
    const r = await api.post(`/restaurant-dashboard/${restaurantId}/menu`, item);
    return r.data.data;
  },
  updateMenuItem: async (restaurantId, itemId, updates) => {
    const r = await api.put(`/restaurant-dashboard/${restaurantId}/menu/${itemId}`, updates);
    return r.data.data;
  },
  deleteMenuItem: async (restaurantId, itemId) => {
    const r = await api.delete(`/restaurant-dashboard/${restaurantId}/menu/${itemId}`);
    return r.data.data;
  },
  toggleOpen: async (restaurantId) => {
    const r = await api.put(`/restaurant-dashboard/${restaurantId}/toggle-open`);
    return r.data.data;
  },
};

export default restaurantDashboardService;
