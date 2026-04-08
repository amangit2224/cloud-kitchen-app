const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('customer'), createOrder);
router.get('/', authenticate, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', authenticate, cancelOrder); // customer or admin

module.exports = router;