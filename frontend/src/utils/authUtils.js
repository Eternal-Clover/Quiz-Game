import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance dengan interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get current token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token') && !!localStorage.getItem('user');
};

// Check auth status on app load
export const checkAuth = async () => {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (savedToken && savedUser) {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        const user = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, token: savedToken };
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuth();
      return { success: false };
    }
  }
  return { success: false };
};

// Register user
export const register = async (username, email, password) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      email,
      password
    });

    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, data: user };
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed';
    return { success: false, message };
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });

    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, data: user };
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    return { success: false, message };
  }
};

// Logout user
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Update profile
export const updateProfile = async (updates) => {
  try {
    const response = await api.put('/auth/profile', updates);
    
    if (response.data.success) {
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, data: user };
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Update failed';
    return { success: false, message };
  }
};

// Get API instance
export const getApi = () => api;
