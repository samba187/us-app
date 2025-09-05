import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('us_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('us_token');
      localStorage.removeItem('us_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};

export const reminderService = {
  getAll: async () => {
    const response = await api.get('/reminders');
    return response.data;
  },

  create: async (reminder) => {
    const response = await api.post('/reminders', reminder);
    return response.data;
  },

  update: async (id, updates) => {
    const response = await api.put(`/reminders/${id}`, updates);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  },
};

export const restaurantService = {
  getAll: async () => {
    const response = await api.get('/restaurants');
    return response.data;
  },

  create: async (restaurant) => {
    const response = await api.post('/restaurants', restaurant);
    return response.data;
  },

  update: async (id, updates) => {
    const response = await api.put(`/restaurants/${id}`, updates);
    return response.data;
  },
};

export const activityService = {
  getAll: async () => {
    const response = await api.get('/activities');
    return response.data;
  },

  create: async (activity) => {
    const response = await api.post('/activities', activity);
    return response.data;
  },

  update: async (id, updates) => {
    const response = await api.put(`/activities/${id}`, updates);
    return response.data;
  },
};

export const wishlistService = {
  getAll: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  create: async (item) => {
    const response = await api.post('/wishlist', item);
    return response.data;
  },

  update: async (id, updates) => {
    const response = await api.put(`/wishlist/${id}`, updates);
    return response.data;
  },
};

export const photoService = {
  getAll: async () => {
    const response = await api.get('/photos');
    return response.data;
  },

  create: async (photo) => {
    const response = await api.post('/photos', photo);
    return response.data;
  },
};

export const noteService = {
  getAll: async () => {
    const response = await api.get('/notes');
    return response.data;
  },

  create: async (note) => {
    const response = await api.post('/notes', note);
    return response.data;
  },

  update: async (id, updates) => {
    const response = await api.put(`/notes/${id}`, updates);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

export default api;
