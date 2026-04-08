const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

// Create review (authenticated users only)
router.post('/', authenticate, reviewController.createReview);

// Get review for specific order
router.get('/order/:orderId', authenticate, reviewController.getOrderReview);

// Get all reviews (admin only)
router.get('/', authenticate, authorize('admin'), reviewController.getAllReviews);

// Delete review (admin only)
router.delete('/:id', authenticate, authorize('admin'), reviewController.deleteReview);

module.exports = router;