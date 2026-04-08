const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const orderRoutes = require('./order');
const userRoutes = require('./user');
const reviewRoutes = require('./review');
const favoriteRoutes = require('./favorite');
const analyticsRoutes = require('./analytics');
const riderRoutes = require('./riderRoutes');
const paymentRoutes = require('./paymentRoutes'); 

// Mount routes
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/user', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/riders', riderRoutes);
router.use('/payments', paymentRoutes); 

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;