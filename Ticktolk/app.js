// api.js (frontend)
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (userData) => API.post('/api/auth/register', userData);
export const login = (userData) => API.post('/api/auth/login', userData);
export const uploadVideo = (formData) => API.post('/api/videos/upload', formData);
export const getFeed = () => API.get('/api/videos/feed');
export const startStream = () => API.post('/api/live/start');
export const purchaseCoins = (orderData) => API.post('/api/payments/create-order', orderData); 