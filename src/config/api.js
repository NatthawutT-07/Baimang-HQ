import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Standardization & Unwrapping
api.interceptors.response.use(
  (response) => {
    // If it's a standardized response from our backend
    if (response.data && typeof response.data === 'object' && ('success' in response.data || 'ok' in response.data)) {
      const { success, ok, data, meta, message } = response.data;
      
      // Attach useful properties directly to the response object
      response.ok = success || ok;
      response.data = data; // Unwrap the data layer
      response.meta = meta;
      response.message = message;
    } else {
      response.ok = response.status >= 200 && response.status < 300;
    }
    return response;
  },
  (error) => {
    // Standardization for Error Responses
    const data = error.response?.data;
    if (data) {
      let extractedMessage = null;

      if (typeof data === 'object') {
        extractedMessage = data.message || data.error || (data.error?.message);
        error.ok = data.success || data.ok || false;
      } else if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          extractedMessage = parsed.message || parsed.error;
          error.ok = parsed.success || parsed.ok || false;
        } catch (e) {
          // Not a JSON string
        }
      }

      if (extractedMessage) {
        // Handle if extractedMessage itself is a JSON string
        if (typeof extractedMessage === 'string' && extractedMessage.trim().startsWith('{')) {
          try {
            const innerParsed = JSON.parse(extractedMessage);
            extractedMessage = innerParsed.message || extractedMessage;
          } catch (e) {}
        }
        error.message = extractedMessage;
      }
    }

    // Global 401 handling
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
