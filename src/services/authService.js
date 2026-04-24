import api from '../config/api';

export const authService = {
  // --- Async API Methods ---
  login: async (employee_code, password) => {
    // Standardize payload for the backend
    const res = await api.post('/hq/auth/login', { employee_code, password });
    
    // If login successful, persist credentials
    if (res.ok && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  register: async (data) => {
    return await api.post('/hq/auth/register', data);
  },

  fetchProfile: async () => {
    return await api.get('/hq/auth/me');
  },

  // --- Synchronous Helper Methods ---
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
