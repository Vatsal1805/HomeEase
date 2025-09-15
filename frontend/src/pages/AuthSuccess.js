import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Authentication failed. Please try again.', { duration: 2000 });
      navigate('/login');
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Decode the token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.userId,
          email: payload.email,
          userType: payload.role
        };

        // Set auth context
        setAuth({ user, token });
        
        toast.success('Login successful!', { duration: 2000 });
        
        // Redirect based on user type
        if (user.userType === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.userType === 'provider') {
          navigate('/provider-dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        toast.error('Authentication failed. Please try again.', { duration: 2000 });
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Completing authentication...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we sign you in.
        </p>
      </div>
    </div>
  );
};

export default AuthSuccess;
