import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Adicionamos o intercetor aqui para que todos os pedidos futuros levem o token
apiClient.interceptors.request.use(
  (config) => {
    // Garante que o código só corre no navegador e não no servidor do Next.js
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const searchAPI = async (query, type = null, limit = 50, options = {}) => {
  try {
    const params = { q: query, limit };
    if (type) params.type = type;
    if (options.tagOnly) params.tagOnly = true;
    const response = await apiClient.get('/search', { params });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getTagSuggestions = async (prefix) => {
  try {
    if (!prefix) return [];
    const response = await apiClient.get('/search/tags', { params: { q: prefix } });
    return response.data.tags || [];
  } catch (error) {
    console.error('Tag suggestion error:', error);
    return [];
  }
};

export const getAbilities = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get('/abilities', { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const getRituals = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get('/rituals', { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const getRules = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get('/rules', { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const getItems = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get('/items', { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const getWeapons = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get('/weapons', { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Exportamos o cliente padrão para o usarmos no Login e nas rotas de edição
export default apiClient;