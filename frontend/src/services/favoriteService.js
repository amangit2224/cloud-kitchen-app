import API from './api';

// Add to favorites
export const addFavorite = async (menuItemId) => {
  try {
    const response = await API.post('/favorites', { menuItemId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add to favorites' };
  }
};

// Remove from favorites
export const removeFavorite = async (menuItemId) => {
  try {
    const response = await API.delete(`/favorites/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove from favorites' };
  }
};

// Get all favorites
export const getFavorites = async () => {
  try {
    const response = await API.get('/favorites');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get favorites' };
  }
};

// Check if item is favorited
export const checkFavorite = async (menuItemId) => {
  try {
    const response = await API.get(`/favorites/check/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check favorite' };
  }
};