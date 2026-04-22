import api from '../config/api';

export const logService = {
  getAll: async (params = {}) => {
    const response = await api.get('/hq/logs', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hq/logs/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/hq/logs', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/hq/logs/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hq/logs/${id}`);
    return response.data;
  },
};
