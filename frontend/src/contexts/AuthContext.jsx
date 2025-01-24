import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const navigateBasedOnUserType = (user) => {
    if (user.user_type === 'pregnant') {
      navigate('/pregnant/dashboard');
    } else if (user.user_type === 'caregiver') {
      navigate('/caregiver/dashboard');
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/account/users/me/');
      setUser(response.data);
      // Navigate based on user type if we're on the home page
      if (window.location.pathname === '/') {
        navigateBasedOnUserType(response.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/account/login/', credentials);
      const { token, user, message } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        setUser(user);
        navigateBasedOnUserType(user);
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

  const register = async (userData) => {
    try {
      const response = await api.post('/account/register/', userData);
      const { token, user, message } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/');
      return { success: true, message };
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.errors || error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
