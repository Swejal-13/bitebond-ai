import api from './api';

const aiService = {
  recommendFood: async (data) => {
    const res = await api.post('/ai/recommend-food', data);
    return res.data.data;
  },
  recommendGift: async (data) => {
    const res = await api.post('/ai/recommend-gift', data);
    return res.data.data;
  },
  planCelebration: async (data) => {
    const res = await api.post('/ai/plan-celebration', data);
    return res.data.data;
  },
  generateWish: async (data) => {
    const res = await api.post('/ai/generate-wish', data);
    return res.data.data;
  },
  chatSupport: async (message, orderId) => {
    const res = await api.post('/ai/chat-support', { message, orderId });
    return res.data.data;
  },
};

export default aiService;
