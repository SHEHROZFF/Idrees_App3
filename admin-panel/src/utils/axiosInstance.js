// src/utils/axiosInstance.js
import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ecom-app-orpin-ten.vercel.app', // Replace with your backend API
});

// Request interceptor to add the token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling (optional)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized access (401) globally
    if (error.response && error.response.status === 401) {
      // Optionally dispatch a logout action or redirect to login
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
