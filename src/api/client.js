import axios from 'axios';

export const API_BASE = 'https://restaurant-management-system-backend-q6an.onrender.com/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('rms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      (err.response && err.response.data && err.response.data.message) ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default client;
