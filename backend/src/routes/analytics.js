const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Get dashboard statistics
router.get('/stats', analyticsController.getDashboardStats);

// Get revenue by day
router.get('/revenue-by-day', analyticsController.getRevenueByDay);

// Get top selling items
router.get('/top-items', analyticsController.getTopSellingItems);

// Get recent activity
router.get('/recent-activity', analyticsController.getRecentActivity);

// Get orders by status
router.get('/orders-by-status', analyticsController.getOrdersByStatus);

module.exports = router;