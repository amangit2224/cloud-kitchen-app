import API from './api';

// Get all menu items
export const getAllMenuItems = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.available !== undefined) params.append('available', filters.available);

    const response = await API.get(`/menu?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch menu items' };
  }
};

// Get single menu item
export const getMenuItemById = async (id) => {
  try {
    const response = await API.get(`/menu/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch menu item' };
  }
};

// Create menu item (Admin only)
export const createMenuItem = async (itemData) => {
  try {
    const response = await API.post('/menu', itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create menu item' };
  }
};

// Update menu item (Admin only)
export const updateMenuItem = async (id, itemData) => {
  try {
    const response = await API.put(`/menu/${id}`, itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update menu item' };
  }
};

// Delete menu item (Admin only)
export const deleteMenuItem = async (id) => {
  try {
    const response = await API.delete(`/menu/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete menu item' };
  }
};