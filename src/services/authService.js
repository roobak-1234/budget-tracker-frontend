import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/signin', {
      username: credentials.email, // Backend expects username field
      password: credentials.password
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/signup', {
      username: userData.email, // Use email as username
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      currency: userData.currency
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await api.put('/profile', {
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        currency: profileData.currency
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  resetPassword: async (email, newPassword) => {
    const response = await api.post('/reset-password', {
      email: email,
      newPassword: newPassword
    });
    return response.data;
  },

  registerAdmin: async (userData) => {
    const response = await api.post('/signup-admin', {
      username: userData.email,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      currency: userData.currency
    });
    return response.data;
  },

  deleteAccount: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await api.delete('/delete-account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};