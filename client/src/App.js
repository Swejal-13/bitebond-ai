import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { getMe } from './redux/slices/authSlice';

import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import GiftPage from './pages/GiftPage';
import GiftDetailPage from './pages/GiftDetailPage';
import GiftCartPage from './pages/GiftCartPage';
import OccasionPlannerPage from './pages/OccasionPlannerPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import RestaurantDashboardPage from './pages/restaurant-dashboard/RestaurantDashboardPage';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { mode } = useSelector((s) => s.theme);

  useEffect(() => { if (token) dispatch(getMe()); }, [dispatch, token]);

  return (
    <div className={mode}>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            <Route path="/auth/callback" element={<OAuthCallbackPage />} />

            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/gifts" element={<GiftPage />} />
              <Route path="/gifts/:id" element={<GiftDetailPage />} />
              <Route path="/celebrate" element={<OccasionPlannerPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/gift-cart" element={<GiftCartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['restaurant_owner', 'admin']} />}>
                <Route path="/restaurant-dashboard/:restaurantId" element={<RestaurantDashboardPage />} />
              </Route>
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>

      <Toaster position="top-center" gutter={8} toastOptions={{
        duration: 3500,
        style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500 },
        success: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
      }} />
    </div>
  );
}

export default App;
