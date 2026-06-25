/**
 * Restaurant Service — Frontend API calls
 */
import api from './api';

const restaurantService = {
  getRestaurants: async (params = {}) => {
    const res = await api.get('/restaurants', { params });
    return res.data;
  },
  search: async (q, city = 'Pune', page = 1) => {
    const res = await api.get('/restaurants/search', { params: { q, city, page } });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/restaurants/${id}`);
    return res.data.data;
  },
  getMenu: async (id) => {
    const res = await api.get(`/restaurants/${id}/menu`);
    return res.data.data;
  },
  getCuisines: async () => {
    const res = await api.get('/restaurants/cuisines');
    return res.data.data.cuisines;
  },
};

export default restaurantService;
