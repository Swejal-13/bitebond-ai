import api from './api';

const orderService = {
  placeOrder: async (data) => {
    const res = await api.post('/orders', data);
    return res.data.data;
  },
  getMyOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },
  cancel: async (id, reason) => {
    const res = await api.put(`/orders/${id}/cancel`, { reason });
    return res.data.data;
  },
};

export default orderService;
