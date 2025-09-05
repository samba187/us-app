// src/api/index.js (ou src/authService.js selon ton projet)
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Token
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('us_token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Erreurs globales
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const s = error.response?.status;
    const d = error.response?.data;
    if (s === 401) {
      localStorage.removeItem('us_token');
      localStorage.removeItem('us_user');
      window.location.href = '/';
    }
    if (s === 409 && d?.error === 'not_in_couple') {
      if (window.location.pathname !== '/onboarding-couple') {
        window.location.href = '/onboarding-couple';
      }
    }
    return Promise.reject(error);
  }
);

// --- Services ---
export const authService = {
  login: async (email, password) => (await api.post('/login', { email, password })).data,
  register: async (name, email, password) =>
    (await api.post('/register', { name, email, password })).data,
};

export const coupleService = {
  me: async () => (await api.get('/couple/me')).data,
  create: async () => (await api.post('/couple/create')).data,
  join: async (invite_code) => (await api.post('/couple/join', { invite_code })).data,
  refreshInvite: async () => (await api.post('/couple/invite/refresh')).data,
};

export default api;
