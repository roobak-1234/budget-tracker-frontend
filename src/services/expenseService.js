import axios from 'axios';

const API_URL = 'http://localhost:8080/api/expenses';

const createAuthenticatedApi = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
};

export const expenseService = {
  getExpenses: async (params = {}) => {
    const api = createAuthenticatedApi();
    const response = await api.get('', { params });
    return response.data;
  },

  getExpenseById: async (id) => {
    const api = createAuthenticatedApi();
    const response = await api.get(`/${id}`);
    return response.data;
  },

  createExpense: async (expenseData) => {
    const api = createAuthenticatedApi();
    const response = await api.post('', expenseData);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const api = createAuthenticatedApi();
    const response = await api.put(`/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    const api = createAuthenticatedApi();
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};