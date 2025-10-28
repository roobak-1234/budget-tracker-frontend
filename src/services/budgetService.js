import axios from 'axios';

const API_URL = 'http://localhost:8080/api/budgets';

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

export const budgetService = {
  getBudgets: async () => {
    const api = createAuthenticatedApi();
    const response = await api.get('');
    return response.data;
  },

  getBudgetById: async (id) => {
    const api = createAuthenticatedApi();
    const response = await api.get(`/${id}`);
    return response.data;
  },

  createBudget: async (budgetData) => {
    const api = createAuthenticatedApi();
    const response = await api.post('', budgetData);
    return response.data;
  },

  updateBudget: async (id, budgetData) => {
    const api = createAuthenticatedApi();
    const response = await api.put(`/${id}`, budgetData);
    return response.data;
  },

  deleteBudget: async (id) => {
    const api = createAuthenticatedApi();
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};