const { Order, OrderItem, MenuItem, User, Review } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database').sequelize;

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Date range for last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    // Total revenue (all time)
    const totalRevenue = await Order.sum('totalAmount', {
      where: {
        status: { [Op.ne]: 'cancelled' }
      }
    });

    // Revenue last 7 days
    const revenueLastWeek = await Order.sum('totalAmount', {
      where: {
        status: { [Op.ne]: 'cancelled' },
        createdAt: { [Op.gte]: last7Days }
      }
    });

    // Total orders
    const totalOrders = await Order.count();

    // Orders last 7 days
    const ordersLastWeek = await Order.count({
      where: {
        createdAt: { [Op.gte]: last7Days }
      }
    });

    // Total customers
    const totalCustomers = await User.count({
      where: { role: 'customer' }
    });

    // New customers last 7 days
    const newCustomersLastWeek = await User.count({
      where: {
        role: 'customer',
        createdAt: { [Op.gte]: last7Days }
      }
    });

    // Pending orders
    const pendingOrders = await Order.count({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] }
      }
    });

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Average rating
    const avgRating = await Review.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
      raw: true
    });

    // Total menu items
    const totalMenuItems = await MenuItem.count();

    // Available menu items
    const availableMenuItems = await MenuItem.count({
      where: { isAvailable: true }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
        revenueLastWeek: parseFloat(revenueLastWeek || 0).toFixed(2),
        totalOrders,
        ordersLastWeek,
        totalCustomers,
        newCustomersLastWeek,
        pendingOrders,
        avgOrderValue: parseFloat(avgOrderValue).toFixed(2),
        avgRating: parseFloat(avgRating?.avgRating || 0).toFixed(1),
        totalMenuItems,
        availableMenuItems
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get revenue by day (last 7 days)
const getRevenueByDay = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const revenueByDay = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders']
      ],
      where: {
        status: { [Op.ne]: 'cancelled' },
        createdAt: { [Op.gte]: last7Days }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: { revenueByDay }
    });

  } catch (error) {
    console.error('Get revenue by day error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get top selling items
const getTopSellingItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topItems = await OrderItem.findAll({
      attributes: [
        'menuItemId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalRevenue']
      ],
      include: [
        {
          model: MenuItem,
          as: 'menuItem',
          attributes: ['id', 'name', 'category', 'price', 'imageUrl']
        }
      ],
      group: ['menuItemId', 'menuItem.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: limit,
      raw: true,
      nest: true
    });

    res.status(200).json({
      success: true,
      data: { topItems }
    });

  } catch (error) {
    console.error('Get top selling items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentOrders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit
    });

    res.status(200).json({
      success: true,
      data: { recentOrders }
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get orders by status
const getOrdersByStatus = async (req, res) => {
  try {
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: { ordersByStatus }
    });

  } catch (error) {
    console.error('Get orders by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueByDay,
  getTopSellingItems,
  getRecentActivity,
  getOrdersByStatus
};