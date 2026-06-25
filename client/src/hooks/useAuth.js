/**
 * useAuth — Custom hook for auth state and actions
 */

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, error, requiresVerification } =
    useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out. See you soon! 👋');
    navigate('/');
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    requiresVerification,
    isVerified: user?.isVerified ?? false,
    isAdmin: user?.role === 'admin',
    isRestaurantOwner: user?.role === 'restaurant_owner',
    logout: handleLogout,
  };
};

export default useAuth;
