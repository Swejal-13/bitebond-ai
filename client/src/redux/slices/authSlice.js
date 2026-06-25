/**
 * Auth Slice — Phase 2
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

export const signup = createAsyncThunk('auth/signup', async (data, { rejectWithValue }) => {
  try { return await authService.signup(data); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Signup failed'); }
});
export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { return await authService.login(data); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});
export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (otp, { rejectWithValue }) => {
  try { return await authService.verifyEmail(otp); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Verification failed'); }
});
export const resendOtp = createAsyncThunk('auth/resendOtp', async (_, { rejectWithValue }) => {
  try { return await authService.resendOtp(); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to resend OTP'); }
});
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try { return await authService.forgotPassword(email); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Request failed'); }
});
export const verifyResetOtp = createAsyncThunk('auth/verifyResetOtp', async (data, { rejectWithValue }) => {
  try { return await authService.verifyResetOtp(data); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Invalid OTP'); }
});
export const resetPassword = createAsyncThunk('auth/resetPassword', async (newPassword, { rejectWithValue }) => {
  try { return await authService.resetPassword(newPassword); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Reset failed'); }
});
export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try { return await authService.getMe(); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to fetch profile'); }
});
export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try { return await authService.updateProfile(data); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Update failed'); }
});
export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authService.logout(); } catch {}
});

const token = localStorage.getItem('bb_token');
const initialState = {
  user: null, token: token || null, isAuthenticated: !!token,
  isLoading: false, error: null, requiresVerification: false,
  resetEmail: null, resetToken: null,
};
const setLoading = (state) => { state.isLoading = true; state.error = null; };
const setError = (state, action) => { state.isLoading = false; state.error = action.payload; };
const setAuth = (state, action) => {
  state.isLoading = false; state.isAuthenticated = true;
  state.user = action.payload.user; state.token = action.payload.token;
  state.requiresVerification = action.payload.requiresVerification || false;
  localStorage.setItem('bb_token', action.payload.token);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setTokenFromOAuth: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('bb_token', action.payload);
    },
    setResetEmail: (state, action) => { state.resetEmail = action.payload; },
    clearResetFlow: (state) => { state.resetEmail = null; state.resetToken = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, setLoading).addCase(signup.fulfilled, setAuth).addCase(signup.rejected, setError)
      .addCase(login.pending, setLoading).addCase(login.fulfilled, setAuth).addCase(login.rejected, setError)
      .addCase(verifyEmail.pending, setLoading)
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false; state.requiresVerification = false;
        if (state.user) state.user.isVerified = true;
      })
      .addCase(verifyEmail.rejected, setError)
      .addCase(resendOtp.pending, setLoading)
      .addCase(resendOtp.fulfilled, (state) => { state.isLoading = false; })
      .addCase(resendOtp.rejected, setError)
      .addCase(forgotPassword.pending, setLoading)
      .addCase(forgotPassword.fulfilled, (state) => { state.isLoading = false; })
      .addCase(forgotPassword.rejected, setError)
      .addCase(verifyResetOtp.pending, setLoading)
      .addCase(verifyResetOtp.fulfilled, (state, action) => {
        state.isLoading = false; state.resetToken = action.payload?.resetToken;
        if (action.payload?.resetToken) {
          localStorage.setItem('bb_token', action.payload.resetToken);
          state.token = action.payload.resetToken;
        }
      })
      .addCase(verifyResetOtp.rejected, setError)
      .addCase(resetPassword.pending, setLoading)
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false; state.resetEmail = null; state.resetToken = null;
        state.token = null; state.isAuthenticated = false;
        localStorage.removeItem('bb_token');
      })
      .addCase(resetPassword.rejected, setError)
      .addCase(getMe.pending, (state) => { state.isLoading = true; })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload.user;
        state.isAuthenticated = true;
        state.requiresVerification = !action.payload.user?.isVerified;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false; state.isAuthenticated = false;
        state.user = null; state.token = null;
        localStorage.removeItem('bb_token');
      })
      .addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload.user; })
      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.token = null; state.isAuthenticated = false;
        state.requiresVerification = false;
        localStorage.removeItem('bb_token'); localStorage.removeItem('bb_cart');
      });
  },
});

export const { clearError, setTokenFromOAuth, setResetEmail, clearResetFlow } = authSlice.actions;
export default authSlice.reducer;
