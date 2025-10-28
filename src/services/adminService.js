import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard-stats');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  suspendUser: async (userId) => {
    const response = await api.put(`/users/${userId}/suspend`);
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await api.put(`/users/${userId}/activate`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  resetUserPassword: async (userId, newPassword) => {
    const response = await api.post(`/users/${userId}/reset-password`, {
      newPassword: newPassword
    });
    return response.data;
  },

  createCategory: async (categoryName) => {
    const response = await api.post('/categories', {
      name: categoryName
    });
    return response.data;
  },

  updateCategory: async (categoryId, categoryName) => {
    const response = await api.put(`/categories/${categoryId}`, {
      name: categoryName
    });
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  }
};