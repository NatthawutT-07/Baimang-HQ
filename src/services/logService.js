import api from '../config/api';

export const logService = {
  getAll: async (params = {}) => {
    return await api.get('/hq/logs', { params });
  },

  getById: async (id) => {
    return await api.get(`/hq/logs/${id}`);
  },

  create: async (data) => {
    return await api.post('/hq/logs', data);
  },

  bulkHitTarget: async (entries, date) => {
    return await api.post('/hq/logs/bulk-hit-target', { entries, date });
  },

  update: async (id, data) => {
    return await api.put(`/hq/logs/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/hq/logs/${id}`);
  },
};
