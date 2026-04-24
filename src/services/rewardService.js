import api from '../config/api';

export const rewardService = {
  getAll: async (params = {}) => {
    return await api.get('/hq/rewards', { params });
  },

  getById: async (id) => {
    return await api.get(`/hq/rewards/${id}`);
  },

  create: async (formData) => {
    return await api.post('/hq/rewards', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: async (id, formData) => {
    return await api.put(`/hq/rewards/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: async (id) => {
    return await api.delete(`/hq/rewards/${id}`);
  },
};
