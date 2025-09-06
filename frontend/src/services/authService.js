// frontend/src/services/authService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Token sur chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('us_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Gestion 401 / 409 globalement
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      localStorage.removeItem('us_token');
      localStorage.removeItem('us_user');
      window.location.href = '/';
    }
    if (status === 409 && data?.error === 'not_in_couple') {
      if (window.location.pathname !== '/onboarding-couple') {
        window.location.href = '/onboarding-couple';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth
export const authService = {
  login: async (email, password) => (await api.post('/login', { email, password })).data,
  register: async (name, email, password) =>
    (await api.post('/register', { name, email, password })).data,
  getUsers: async () => (await api.get('/users')).data,
};

// ---- Couple
export const coupleService = {
  me: async () => (await api.get('/couple/me')).data,
  create: async () => (await api.post('/couple/create')).data,
  join: async (invite_code) => (await api.post('/couple/join', { invite_code })).data,
  refreshInvite: async () => (await api.post('/couple/invite/refresh')).data,
};

// ---- Reminders
export const reminderService = {
  getAll: async () => (await api.get('/reminders')).data,
  create: async (reminder) => (await api.post('/reminders', reminder)).data,
  update: async (id, updates) => (await api.put(`/reminders/${id}`, updates)).data,
  delete: async (id) => (await api.delete(`/reminders/${id}`)).data,
};

// ---- Restaurants
export const restaurantService = {
  getAll: async () => (await api.get('/restaurants')).data,
  create: async (restaurant) => (await api.post('/restaurants', restaurant)).data,
  update: async (id, updates) => (await api.put(`/restaurants/${id}`, updates)).data,
  delete: async (id) => (await api.delete(`/restaurants/${id}`)).data,
};

// ---- Activities
export const activityService = {
  getAll: async () => (await api.get('/activities')).data,
  create: async (activity) => (await api.post('/activities', activity)).data,
  update: async (id, updates) => (await api.put(`/activities/${id}`, updates)).data,
  delete: async (id) => (await api.delete(`/activities/${id}`)).data,
};

// ---- Wishlist
export const wishlistService = {
  getAll: async () => (await api.get('/wishlist')).data,
  create: async (item) => (await api.post('/wishlist', item)).data,
  update: async (id, updates) => (await api.put(`/wishlist/${id}`, updates)).data,
  delete: async (id) => (await api.delete(`/wishlist/${id}`)).data,
};

// ---- Photos
export const photoService = {
  getAll: async () => (await api.get('/photos')).data,
  create: async (photo) => (await api.post('/photos', photo)).data,
  update: async (id, updates) => (await api.put(`/photos/${id}`, updates)).data,
  delete: async (id) => (await api.delete(`/photos/${id}`)).data,
  
  // Upload avec fichier
  uploadMultipart: async (formData) => {
    // Endpoint /photos gère déjà la création des documents en base.
    const token = localStorage.getItem('us_token');
    const res = await axios.post(`${API_BASE_URL}/photos`, formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.data; // tableau de photos créées
  },
  compressImage: async (file, { maxWidth = 1600, quality = 0.75 } = {}) => {
    if (!file.type.startsWith('image/')) return file;
    const img = document.createElement('img');
    const url = URL.createObjectURL(file);
    try {
      await new Promise((res, rej) => {
        img.onload = res; img.onerror = rej; img.src = url;
      });
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));
      if (!blob) return file;
      return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

// ---- Notes
export const noteService = {
  getAll: async () => (await api.get('/notes')).data,
  create: async (note) => (await api.post('/notes', note)).data,
  update: async (id, updates) => (await api.put(`/notes/${id}`, updates)).data,
  delete: async (id) => (await api.delete(`/notes/${id}`)).data,
};

export default api;
