import api from '../config/api';

export const authService = {
  register: async (employeeData) => {
    const response = await api.post('/hq/auth/register', employeeData);
    return response.data;
  },

  login: async (employee_code, password) => {
    const response = await api.post('/hq/auth/login', { employee_code, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },
};
