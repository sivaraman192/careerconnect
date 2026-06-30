import axios from 'axios';

console.log("API BASE URL:", import.meta.env.VITE_API_URL);

let apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (apiURL && !apiURL.endsWith('/api') && !apiURL.endsWith('/api/')) {
  const normalized = apiURL.replace(/\/$/, '');
  apiURL = `${normalized}/api`;
}

const api = axios.create({
  baseURL: apiURL,
});

// Request interceptor to automatically attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
