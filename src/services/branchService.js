import api from '../config/api';

export const branchService = {
  getAll: async (params = {}) => {
    const response = await api.get('/hq/branches', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hq/branches/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/hq/branches', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/hq/branches/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hq/branches/${id}`);
    return response.data;
  },
};
