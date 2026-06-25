import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTokenFromOAuth, getMe } from '../../redux/slices/authSlice';
import LoadingScreen from '../../components/common/LoadingScreen';
import toast from 'react-hot-toast';

const OAuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    if (error || !token) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }
    dispatch(setTokenFromOAuth(token));
    dispatch(getMe()).then(() => {
      toast.success('Signed in with Google! ❤️');
      navigate('/', { replace: true });
    });
  }, [dispatch, navigate, params]);

  return <LoadingScreen />;
};

export default OAuthCallbackPage;
