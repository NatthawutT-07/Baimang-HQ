import api from '../config/api';

export const employeeService = {
  getAll: async (params = {}) => {
    return await api.get('/hq/employees', { params });
  },

  getById: async (id) => {
    return await api.get(`/hq/employees/${id}`);
  },

  getByCode: async (employee_code) => {
    return await api.get(`/hq/employees/code/${employee_code}`);
  },

  getStats: async (id) => {
    return await api.get(`/hq/employees/${id}/stats`);
  },

  create: async (data) => {
    return await api.post('/hq/employees', data);
  },

  bulkCreate: async (employees) => {
    return await api.post('/hq/employees/bulk', { employees });
  },

  resetAllPoints: async () => {
    return await api.post('/hq/employees/reset-all-points');
  },

  update: async (id, data) => {
    return await api.put(`/hq/employees/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/hq/employees/${id}`);
  },
};
