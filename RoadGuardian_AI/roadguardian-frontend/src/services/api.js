import axios from 'axios';

const API_BASE = 'http://localhost:8000'; // Or whatever port FastAPI runs on
const TOKEN_KEY = 'roadguardian_token';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    // Note: FastAPI OAuth2PasswordRequestForm expects form data, but looking at main.py, it uses custom logic in auth router.
    // I'll stick to JSON for now, assuming backend auth/login endpoint accepts it.
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.access_token);
    return res.data;
  },
  register: async (email, password, fullName) => {
    const res = await api.post('/auth/register', { email, password, full_name: fullName });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const hazardService = {
  getHeatmap: async (bounds) => {
    const { north, south, east, west } = bounds;
    const res = await api.get(`/hazards/heatmap?north=${north}&south=${south}&east=${east}&west=${west}`);
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get('/hazards/dashboard');
    return res.data;
  },
  uploadHazard: async (formData) => {
    // formData containing image and other data
    const res = await api.post('/hazards/upload', formData);
    return res.data;
  }
};

export const getWebSocketUrl = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Note: we assume backend is at API_BASE, so we extract the hostname/port
  const host = new URL(API_BASE).host;
  return `${wsProtocol}//${host}/ws/hazards`;
};
