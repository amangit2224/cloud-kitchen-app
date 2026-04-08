import API from './api';

// Get user profile with addresses
export const getProfile = async () => {
  try {
    const response = await API.get('/user/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load profile' };
  }
};

// Update user profile
export const updateProfile = async (userData) => {
  try {
    const response = await API.put('/user/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await API.put('/user/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

// Get all addresses
export const getAddresses = async () => {
  try {
    const response = await API.get('/user/addresses');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to load addresses' };
  }
};

// Add address
export const addAddress = async (addressData) => {
  try {
    const response = await API.post('/user/addresses', addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add address' };
  }
};

// Update address
export const updateAddress = async (id, addressData) => {
  try {
    const response = await API.put(`/user/addresses/${id}`, addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update address' };
  }
};

// Delete address
export const deleteAddress = async (id) => {
  try {
    const response = await API.delete(`/user/addresses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete address' };
  }
};