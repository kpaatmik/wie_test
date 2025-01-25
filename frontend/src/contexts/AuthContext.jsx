import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getRedirectPath = useCallback((user) => {
    if (!user.is_verified) return '/verify-id';
    if (user.user_type === 'pregnant') return '/pregnant/dashboard';
    if (user.user_type === 'caregiver') return '/caregiver/dashboard';
    return '/';
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/account/users/me/');
      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      
      // Only redirect if we're on a non-protected route
      const publicRoutes = ['/login', '/register', '/'];
      if (publicRoutes.includes(location.pathname)) {
        const redirectPath = getRedirectPath(userData);
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname, getRedirectPath]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, [fetchUser]);

  const login = async (credentials) => {
    try {
      const response = await api.post('/account/login/', credentials);
      const { token, user: userData, message } = response.data;
      
      if (token && userData) {
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);
        
        const redirectPath = getRedirectPath(userData);
        navigate(redirectPath, { replace: true });
        return { success: true, message };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/account/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { token, user: userData, message } = response.data;
      
      if (token && userData) {
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);
        navigate('/verify-id', { replace: true });
        return { success: true, message };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.errors || error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
