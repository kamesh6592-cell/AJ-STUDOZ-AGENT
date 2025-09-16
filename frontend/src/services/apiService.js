import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add API key
api.interceptors.request.use(
  (config) => {
    // Add API key from localStorage if available
    const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
    const provider = config.data?.provider || config.params?.provider;
    
    if (provider && apiKeys[provider]) {
      config.headers['x-api-key'] = apiKeys[provider];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: () => api.get('/api/health'),
  
  // Chat with AI
  chat: async (provider, messages, apiKey) => {
    const response = await api.post('/api/ai/chat', {
      provider,
      messages,
      apiKey
    });
    return response.data;
  },
  
  // Generate website
  generateWebsite: async (provider, prompt, apiKey) => {
    const response = await api.post('/api/ai/generate-website', {
      provider,
      prompt,
      apiKey
    });
    return response.data;
  },
  
  // Test API connection
  testConnection: async (provider, apiKey) => {
    const response = await api.post('/api/ai/chat', {
      provider,
      messages: [{ role: 'user', content: 'Hello' }],
      apiKey
    });
    return response.data;
  },
  
  // File upload
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    
    return response.data;
  },
  
  // Delete file
  deleteFile: async (filename) => {
    const response = await api.delete(`/api/files/${filename}`);
    return response.data;
  },
  
  // Project CRUD
  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },
  
  getProjects: async (params = {}) => {
    const response = await api.get('/api/projects', { params });
    return response.data;
  },
  
  getProject: async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },
  
  updateProject: async (id, projectData) => {
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
  },
  
  deleteProject: async (id) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  }
};

export default api;
