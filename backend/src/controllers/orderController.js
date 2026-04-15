const { Op } = require('sequelize');
const { Order, OrderItem, MenuItem, User, PromoCode, sequelize } = require('../models');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../utils/email');

// ── Helper: emit order update to relevant parties ────────────────────────────
const emitOrderUpdate = (req, order, eventType = 'orderUpdated') => {
  const io = req.app.get('io');
  if (!io) return;

  const payload = {
    orderId: order.id,
    status: order.status,
    riderStatus: order.riderStatus,
    updatedAt: order.updatedAt,
    eventType,
  };

  // Notify the customer
  io.to(`user_${order.userId}`).emit(eventType, payload);
  // Notify all admins
  io.to('admin_room').emit(eventType, payload);
};

// ── Create Order ──────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, phoneNumber, notes, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Item ${item.menuItemId} not available` });
      }
      const subtotal = parseFloat(menuItem.price) * item.quantity;
      totalAmount += subtotal;
      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal,
        specialInstructions: item.specialInstructions || null,
      });
    }

    // Apply discount if promo code present
    let discountAmount = 0;
    if (req.body.promoCode) {
      const promo = await PromoCode.findOne({
        where: {
          code: req.body.promoCode.toUpperCase().trim(),
          isActive: true,
          [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }]
        }
      });
      if (promo && (promo.usageLimit === null || promo.usedCount < promo.usageLimit)
          && totalAmount >= parseFloat(promo.minOrderAmount)) {
        if (promo.discountType === 'percentage') {
          discountAmount = (totalAmount * parseFloat(promo.discountValue)) / 100;
          if (promo.maxDiscountAmount) discountAmount = Math.min(discountAmount, parseFloat(promo.maxDiscountAmount));
        } else {
          discountAmount = parseFloat(promo.discountValue);
        }
        discountAmount = Math.min(discountAmount, totalAmount);
        await promo.increment('usedCount');
      }
    }

    const order = await Order.create({
      userId,
      totalAmount: totalAmount - discountAmount,
      status: 'pending',
      deliveryAddress,
      phoneNumber,
      notes,
      paymentMethod: paymentMethod || 'cod',
    });

    // Create order items
    for (const item of orderItemsData) {
      await OrderItem.create({ orderId: order.id, ...item });
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'orderItems', include: [{ model: MenuItem, as: 'menuItem' }] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      ]
    });

    // Emit to admin room — new order arrived
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('newOrder', {
        orderId: fullOrder.id,
        userId,
        totalAmount: fullOrder.totalAmount,
        status: fullOrder.status,
        createdAt: fullOrder.createdAt,
      });
    }

    // Send email confirmation
    try {
      const user = await User.findByPk(userId);
      if (user && user.email) {
        await sendOrderConfirmationEmail(user.email, user.name, fullOrder);
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', data: fullOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// ── Get All Orders (admin) ────────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    // If customer, only their orders
    if (req.user.role === 'customer') {
      where.userId = req.user.id;
    }

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'orderItems', include: [{ model: MenuItem, as: 'menuItem' }] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: orders,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// ── Get Order By ID ───────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'orderItems', include: [{ model: MenuItem, as: 'menuItem' }] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      ]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Customers can only see their own orders
    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// ── Update Order Status (admin) ───────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const oldStatus = order.status;
    await order.update({ status });

    // 🔴 REAL-TIME: notify customer and admins
    emitOrderUpdate(req, order, 'orderStatusUpdated');

    // Send email notification for status change
    try {
      const user = await User.findByPk(order.userId);
      if (user && user.email) {
        await sendOrderStatusEmail(user.email, user.name, order, oldStatus, status);
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// ── Cancel Order (customer) ───────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only the owner can cancel
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Can only cancel before preparing
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at this stage. Current status: ${order.status}`
      });
    }

    const oldStatus = order.status;
    await order.update({
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by customer',
    });

    //  REAL-TIME: notify admin
    emitOrderUpdate(req, order, 'orderCancelled');

    // Send email notification for cancellation
    try {
      const user = await User.findByPk(order.userId);
      if (user && user.email) {
        await sendOrderStatusEmail(user.email, user.name, order, oldStatus, 'cancelled');
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder };