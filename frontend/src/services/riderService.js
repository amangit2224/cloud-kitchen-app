import API from './api';

// Get all riders (admin only)
export const getAllRiders = async () => {
  try {
    // Add timestamp to prevent caching
    const response = await API.get('/riders/admin/all', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('getAllRiders error:', error);
    throw error.response?.data || { message: 'Failed to load riders' };
  }
};

// Approve or reject a rider (admin only)
export const approveRider = async (userId, status) => {
  try {
    const response = await API.put(`/riders/admin/${userId}/approve`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update rider status' };
  }
};

// Get available riders for admin to assign to orders (admin only)
export const getAvailableRiders = async () => {
  try {
    const response = await API.get('/riders/admin/available', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load available riders' };
  }
};

// Assign a rider to an order (admin only)
export const assignRider = async (orderId, riderId) => {
  try {
    const response = await API.put(`/riders/admin/assign/${orderId}`, { riderId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to assign rider' };
  }
};

// Register as a rider (public)
export const registerRider = async (riderData) => {
  try {
    const response = await API.post('/riders/register', riderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to register as rider' };
  }
};

// Get rider profile (rider only)
export const getRiderProfile = async () => {
  try {
    const response = await API.get('/riders/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load profile' };
  }
};

// Toggle availability (rider only)
export const toggleAvailability = async () => {
  try {
    const response = await API.put('/riders/availability');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle availability' };
  }
};

// Get available orders for rider (rider only)
export const getAvailableOrders = async () => {
  try {
    const response = await API.get('/riders/available-orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load available orders' };
  }
};

// Accept an order (rider only)
export const acceptOrder = async (orderId) => {
  try {
    const response = await API.post(`/riders/accept/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to accept order' };
  }
};

// Mark order as picked up (rider only)
export const markPickedUp = async () => {
  try {
    const response = await API.put('/riders/picked-up');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark as picked up' };
  }
};

// Mark order as delivered (rider only)
export const markDelivered = async () => {
  try {
    const response = await API.put('/riders/delivered');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark as delivered' };
  }
};

// Get active order (rider only)
export const getActiveOrder = async () => {
  try {
    const response = await API.get('/riders/active-order');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load active order' };
  }
};

// Get delivery history (rider only)
export const getDeliveryHistory = async () => {
  try {
    const response = await API.get('/riders/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load delivery history' };
  }
};