import API from './api';

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await API.get('/analytics/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get stats' };
  }
};

// Get revenue by day
export const getRevenueByDay = async () => {
  try {
    const response = await API.get('/analytics/revenue-by-day');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get revenue data' };
  }
};

// Get top selling items
export const getTopSellingItems = async (limit = 5) => {
  try {
    const response = await API.get(`/analytics/top-items?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get top items' };
  }
};

// Get recent activity
export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await API.get(`/analytics/recent-activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get recent activity' };
  }
};

// Get orders by status
export const getOrdersByStatus = async () => {
  try {
    const response = await API.get('/analytics/orders-by-status');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get orders by status' };
  }
};