import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getAllOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const cancelOrder = async (id, reason) => {
  const response = await api.put(`/orders/${id}/cancel`, { reason });
  return response.data;
};