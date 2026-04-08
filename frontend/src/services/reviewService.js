import API from './api';

// Create review
export const createReview = async (reviewData) => {
  try {
    const response = await API.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit review' };
  }
};

// Get review for order
export const getOrderReview = async (orderId) => {
  try {
    const response = await API.get(`/reviews/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get review' };
  }
};

// Get all reviews (admin)
export const getAllReviews = async () => {
  try {
    const response = await API.get('/reviews');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get reviews' };
  }
};

// Delete review (admin)
export const deleteReview = async (id) => {
  try {
    const response = await API.delete(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete review' };
  }
};