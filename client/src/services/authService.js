/**
 * Auth Service — Phase 2
 */
import api from './api';

const authService = {
  signup: async (data) => { const r = await api.post('/auth/signup', data); return r.data.data; },
  login: async (data) => { const r = await api.post('/auth/login', data); return r.data.data; },
  verifyEmail: async (otp) => { const r = await api.post('/auth/verify-email', { otp }); return r.data; },
  resendOtp: async () => { const r = await api.post('/auth/resend-otp'); return r.data; },
  forgotPassword: async (email) => { const r = await api.post('/auth/forgot-password', { email }); return r.data; },
  verifyResetOtp: async (data) => { const r = await api.post('/auth/verify-reset-otp', data); return r.data.data; },
  resetPassword: async (newPassword) => { const r = await api.post('/auth/reset-password', { newPassword }); return r.data; },
  getMe: async () => { const r = await api.get('/auth/me'); return r.data.data; },
  updateProfile: async (formData) => {
    const r = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data.data;
  },
  changePassword: async (data) => { const r = await api.put('/auth/change-password', data); return r.data; },
  logout: async () => { await api.post('/auth/logout'); },
};

export default authService;
