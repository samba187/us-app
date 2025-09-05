import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('us_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer erreurs globales
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('us_token');
      localStorage.removeItem('us_user');
      window.location.href = '/';
    }
    if (error.response?.status === 409 && error.response?.data?.error === 'not_in_couple') {
      if (window.location.pathname !== '/onboarding-couple') {
        window.location.href = '/onboarding-couple';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => (await api.post('/login', { email, password })).data,
  register: async (name, email, password) =>
    (await api.post('/register', { name, email, password })).data,
  getUsers: async () => (await api.get('/users')).data,
};

export const coupleService = {
  me: async () => (await api.get('/couple/me')).data,
  create: async () => (await api.post('/couple/create')).data,
  join: async (invite_code) => (await api.post('/couple/join', { invite_code })).data,
  refreshInvite: async () => (await api.post('/couple/invite/refresh')).data,
};

export default api;
