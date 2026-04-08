const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Add to favorites
router.post('/', favoriteController.addFavorite);

// Get user's favorites
router.get('/', favoriteController.getFavorites);

// Check if item is favorited
router.get('/check/:menuItemId', favoriteController.checkFavorite);

// Remove from favorites
router.delete('/:menuItemId', favoriteController.removeFavorite);

module.exports = router;