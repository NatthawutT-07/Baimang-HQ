import api from '../config/api';

export const rewardService = {
  getAll: async (params = {}) => {
    const response = await api.get('/hq/rewards', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hq/rewards/${id}`);
    return response.data;
  },

  create: async (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post('/hq/rewards', data, config);
    return response.data;
  },

  update: async (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.put(`/hq/rewards/${id}`, data, config);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hq/rewards/${id}`);
    return response.data;
  },
};
