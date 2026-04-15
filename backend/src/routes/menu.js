const express = require('express');
const router  = express.Router();
const { getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate, menuItemRules } = require('../middleware/validators');

// Public routes
router.get('/',    getAllMenuItems);
router.get('/:id', getMenuItemById);

// Admin routes — with validation
router.post('/',    authenticate, isAdmin, menuItemRules, validate, createMenuItem);
router.put('/:id',  authenticate, isAdmin, validate, updateMenuItem);
router.delete('/:id', authenticate, isAdmin, deleteMenuItem);

module.exports = router;