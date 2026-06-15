import axios from 'axios';

const api = axios.create({ baseURL: '/events' });

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

export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/${id}`);
  return data;
};

export const checkHealth = async () => {
  const { data } = await axios.get('/health');
  return data;
};
