const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

// Protected admin routes
router.post('/', authenticate, isAdmin, createMenuItem);
router.put('/:id', authenticate, isAdmin, updateMenuItem);
router.delete('/:id', authenticate, isAdmin, deleteMenuItem);

module.exports = router;
