const express = require('express');
const router  = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, createOrderRules } = require('../middleware/validators');

router.post('/',         authenticate, authorize('customer'), createOrderRules, validate, createOrder);
router.get('/',          authenticate, getAllOrders);
router.get('/:id',       authenticate, getOrderById);
router.put('/:id/status',authenticate, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel',authenticate, cancelOrder);

module.exports = router;