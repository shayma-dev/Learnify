import axios from 'axios';

const API_URL = 'https://your-live-api-url.com'; // غيّريه أول ما يعطوك الرابط الحقيقي

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = Bearer ${token};
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/signup', userData),
};