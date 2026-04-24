import api from '../config/api';

export const branchService = {
  getAll: async (params = {}) => {
    return await api.get('/hq/branches', { params });
  },

  getById: async (id) => {
    return await api.get(`/hq/branches/${id}`);
  },

  create: async (data) => {
    return await api.post('/hq/branches', data);
  },

  update: async (id, data) => {
    return await api.put(`/hq/branches/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/hq/branches/${id}`);
  },
};
