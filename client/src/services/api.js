import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const adminApiKey = import.meta.env.VITE_ADMIN_API_KEY;

const api = axios.create({ baseURL: `${apiBaseUrl}/events` });

api.interceptors.request.use((config) => {
  if (adminApiKey && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['x-api-key'] = adminApiKey;
  }
  return config;
});

export const fetchEvents = async ({ limit = 50, page = 1, type, status } = {}) => {
  const params = { limit, page };
  if (type) params.type = type;
  if (status) params.status = status;
  const { data } = await api.get('/', { params });
  return data;
};

export const simulateEvent = async (payload) => {
  const { data } = await api.post('/simulate', payload);
  return data;
};

export const simulateInventoryAlert = async (payload) => {
  const { data } = await axios.post(`${apiBaseUrl}/inventory/simulate`, payload, {
    headers: adminApiKey ? { 'x-api-key': adminApiKey } : {},
  });
  return data;
};

export const simulateDeliveryUpdate = async (payload) => {
  const { data } = await axios.post(`${apiBaseUrl}/delivery/simulate`, payload, {
    headers: adminApiKey ? { 'x-api-key': adminApiKey } : {},
  });
  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/${id}`);
  return data;
};

export const checkHealth = async () => {
  const { data } = await axios.get(`${apiBaseUrl}/health`);
  return data;
};
