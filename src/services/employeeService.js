import api from '../config/api';

export const employeeService = {
  getAll: async (params = {}) => {
    const response = await api.get('/hq/employees', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hq/employees/${id}`);
    return response.data;
  },

  getByCode: async (employee_code) => {
    const response = await api.get(`/hq/employees/code/${employee_code}`);
    return response.data;
  },

  getStats: async (id) => {
    const response = await api.get(`/hq/employees/${id}/stats`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/hq/employees', data);
    return response.data;
  },

  bulkCreate: async (employees) => {
    const response = await api.post('/hq/employees/bulk', { employees });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/hq/employees/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hq/employees/${id}`);
    return response.data;
  },
};
