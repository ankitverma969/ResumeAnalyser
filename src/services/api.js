import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  analyze: (data) => api.post('/resume/analyze', data),
  getById: (id) => api.get(`/resume/${id}`),
  getAll: () => api.get('/resume'),
  compare: (data) => api.post('/resume/compare', data),
};

export const aiAPI = {
  rewrite: (data) => api.post('/ai/rewrite', data),
  recruiterFeedback: (data) => api.post('/ai/recruiter-feedback', data),
  skillsGap: (data) => api.post('/ai/skills-gap', data),
  interviewProbability: (data) => api.post('/ai/interview-probability', data),
  chatCoach: (data) => api.post('/ai/chat-coach', data),
};

export default api;
