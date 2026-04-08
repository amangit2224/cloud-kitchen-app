const RiderProfile = require('../models/RiderProfile');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendRiderApprovalEmail } = require('../utils/email');
const getSeq = () => require('../config/database').sequelize;

// ─── REGISTRATION ─────────────────────────────────────────────────────────────
const registerRider = async (req, res) => {
  try {
    const User = require('../models/User');
    const { name, email, password, phone, vehicleType, vehicleNumber } = req.body;

    if (!name || !email || !password || !phone || !vehicleType)
      return res.status(400).json({ message: 'All fields are required' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role: 'rider' });
    await RiderProfile.create({
      userId: user.id,
      vehicleType,
      vehicleNumber: vehicleNumber || null,
      approvalStatus: 'pending',
    });

    res.status(201).json({
      message: 'Registration submitted. Awaiting admin approval.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('registerRider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── RIDER PROFILE ────────────────────────────────────────────────────────────
const getRiderProfile = async (req, res) => {
  try {
    const seq = getSeq();
    const rows = await seq.query(
      `SELECT rp.*, u.id as u_id, u.name as userName, u.email as userEmail, u.phone as userPhone
       FROM rider_profiles rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.user_id = :uid LIMIT 1`,
      { replacements: { uid: req.user.id }, type: seq.QueryTypes.SELECT }
    );

    if (!rows.length) return res.status(404).json({ message: 'Rider profile not found' });
    const r = rows[0];

    res.json({
      profile: {
        id: r.id,
        userId: r.user_id,
        vehicleType: r.vehicle_type,
        vehicleNumber: r.vehicle_number,
        isAvailable: !!r.is_available,
        approvalStatus: r.approval_status,
        totalDeliveries: r.total_deliveries,
        totalEarnings: r.total_earnings,
        todayEarnings: r.today_earnings,
        rating: r.rating,
        totalRatings: r.total_ratings,
        currentOrderId: r.current_order_id,
        user: { id: r.u_id, name: r.userName, email: r.userEmail, phone: r.userPhone },
      },
    });
  } catch (error) {
    console.error('getRiderProfile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── TOGGLE AVAILABILITY ──────────────────────────────────────────────────────
const toggleAvailability = async (req, res) => {
  try {
    const profile = await RiderProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Rider profile not found' });
    if (profile.approvalStatus !== 'approved')
      return res.status(403).json({ message: 'Your account is not yet approved by admin' });
    if (profile.currentOrderId && profile.isAvailable)
      return res.status(400).json({ message: 'Complete your current delivery before going offline' });

    profile.isAvailable = !profile.isAvailable;
    await profile.save();

    res.json({
      message: profile.isAvailable ? 'You are now Online' : 'You are now Offline',
      isAvailable: profile.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── AVAILABLE ORDERS (for rider to self-accept) ──────────────────────────────
const getAvailableOrders = async (req, res) => {
  try {
    const profile = await RiderProfile.findOne({ where: { userId: req.user.id } });
    if (!profile || profile.approvalStatus !== 'approved')
      return res.status(403).json({ message: 'Account not approved' });
    if (!profile.isAvailable)
      return res.status(400).json({ message: 'Go online to see available orders' });
    if (profile.currentOrderId)
      return res.status(400).json({ message: 'Complete your current delivery first' });

    const seq = getSeq();
    const orders = await seq.query(
      `SELECT o.*, u.name as customerName, u.phone as customerPhone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.status = 'ready' AND o.rider_id IS NULL
       ORDER BY o.created_at ASC`,
      { type: seq.QueryTypes.SELECT }
    );

    if (!orders.length) return res.json({ orders: [] });

    const items = await seq.query(
      `SELECT oi.*, mi.name as itemName
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id IN (:ids)`,
      { replacements: { ids: orders.map(o => o.id) }, type: seq.QueryTypes.SELECT }
    );

    res.json({
      orders: orders.map(o => ({
        id: o.id,
        status: o.status,
        totalAmount: o.total_amount,
        deliveryAddress: o.delivery_address,
        estimatedEarning: (parseFloat(o.total_amount) * 0.10).toFixed(2),
        customer: { name: o.customerName, phone: o.customerPhone },
        items: items
          .filter(i => i.order_id === o.id)
          .map(i => ({ quantity: i.quantity, menuItem: { name: i.itemName } })),
      })),
    });
  } catch (error) {
    console.error('getAvailableOrders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ACCEPT ORDER (rider self-accepts) ───────────────────────────────────────
const acceptOrder = async (req, res) => {
  try {
    const profile = await RiderProfile.findOne({ where: { userId: req.user.id } });
    if (!profile || profile.approvalStatus !== 'approved')
      return res.status(403).json({ message: 'Account not approved' });
    if (profile.currentOrderId)
      return res.status(400).json({ message: 'You already have an active delivery' });

    const order = await Order.findOne({
      where: { id: req.params.orderId, status: 'ready', riderId: null },
    });
    if (!order) return res.status(404).json({ message: 'Order not available' });

    const earningAmount = (parseFloat(order.totalAmount) * 0.10).toFixed(2);
    
    // Update with proper column names
    await order.update({ 
      riderId: req.user.id, 
      earningAmount, 
      riderAcceptedAt: new Date() 
    });
    await profile.update({ currentOrderId: order.id });

    res.json({ message: 'Order accepted! Go pick it up.', earningAmount });
  } catch (error) {
    console.error('acceptOrder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── MARK PICKED UP ───────────────────────────────────────────────────────────
const markPickedUp = async (req, res) => {
  try {
    const profile = await RiderProfile.findOne({ where: { userId: req.user.id } });
    if (!profile || !profile.currentOrderId)
      return res.status(400).json({ message: 'No active order' });

    const order = await Order.findOne({
      where: { id: profile.currentOrderId, riderId: req.user.id, status: 'ready' },
    });
    if (!order) return res.status(404).json({ message: 'Order not found or already picked up' });

    await order.update({ 
      status: 'out_for_delivery', 
      riderPickedUpAt: new Date() 
    });
    res.json({ message: 'Marked as Out for Delivery!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── MARK DELIVERED ───────────────────────────────────────────────────────────
const markDelivered = async (req, res) => {
  try {
    const profile = await RiderProfile.findOne({ where: { userId: req.user.id } });
    if (!profile || !profile.currentOrderId)
      return res.status(400).json({ message: 'No active order' });

    const order = await Order.findOne({
      where: { id: profile.currentOrderId, riderId: req.user.id, status: 'out_for_delivery' },
    });
    if (!order) return res.status(404).json({ message: 'Order not out for delivery yet' });

    const earning = parseFloat(order.earningAmount) || (parseFloat(order.totalAmount) * 0.10);

    await order.update({ 
      status: 'delivered', 
      riderDeliveredAt: new Date() 
    });

    // FIXED: Properly calculate new totals
    const currentTotalEarnings = parseFloat(profile.totalEarnings) || 0;
    const currentTodayEarnings = parseFloat(profile.todayEarnings) || 0;

    await profile.update({
      currentOrderId: null,
      totalDeliveries: (profile.totalDeliveries || 0) + 1,
      totalEarnings: currentTotalEarnings + earning,
      todayEarnings: currentTodayEarnings + earning,
    });

    res.json({ 
      message: 'Delivery complete!', 
      earning: earning.toFixed(2),
      totalEarnings: (currentTotalEarnings + earning).toFixed(2)
    });
  } catch (error) {
    console.error('markDelivered error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET ACTIVE ORDER ─────────────────────────────────────────────────────────
const getActiveOrder = async (req, res) => {
  try {
    const profile = await RiderProfile.findOne({ where: { userId: req.user.id } });
    if (!profile || !profile.currentOrderId) return res.json({ activeOrder: null });

    const seq = getSeq();
    const rows = await seq.query(
      `SELECT o.*, u.name as customerName, u.phone as customerPhone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = :id LIMIT 1`,
      { replacements: { id: profile.currentOrderId }, type: seq.QueryTypes.SELECT }
    );

    if (!rows.length) return res.json({ activeOrder: null });
    const o = rows[0];

    const items = await seq.query(
      `SELECT oi.*, mi.name as itemName, mi.price as itemPrice
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = :id`,
      { replacements: { id: o.id }, type: seq.QueryTypes.SELECT }
    );

    res.json({
      activeOrder: {
        id: o.id,
        status: o.status,
        totalAmount: o.total_amount,
        earningAmount: o.earning_amount,
        deliveryAddress: o.delivery_address,
        customer: { name: o.customerName, phone: o.customerPhone },
        items: items.map(i => ({
          quantity: i.quantity,
          menuItem: { name: i.itemName, price: i.itemPrice },
        })),
      },
    });
  } catch (error) {
    console.error('getActiveOrder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELIVERY HISTORY ─────────────────────────────────────────────────────────
const getDeliveryHistory = async (req, res) => {
  try {
    const seq = getSeq();
    const rows = await seq.query(
      `SELECT o.*, u.name as customerName
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.rider_id = :rid AND o.status = 'delivered'
       ORDER BY o.rider_delivered_at DESC
       LIMIT 50`,
      { replacements: { rid: req.user.id }, type: seq.QueryTypes.SELECT }
    );

    res.json({
      deliveries: rows.map(o => ({
        id: o.id,
        status: o.status,
        totalAmount: o.total_amount,
        earningAmount: o.earning_amount,
        deliveredAt: o.rider_delivered_at,
        customer: { name: o.customerName },
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ADMIN: GET ALL RIDERS ────────────────────────────────────────────────────
const getAllRiders = async (req, res) => {
  try {
    const seq = getSeq();
    const rows = await seq.query(
      `SELECT rp.id, rp.user_id as userId, rp.vehicle_type as vehicleType,
              rp.vehicle_number as vehicleNumber, rp.is_available as isAvailable,
              rp.approval_status as approvalStatus, rp.total_deliveries as totalDeliveries,
              rp.total_earnings as totalEarnings, rp.today_earnings as todayEarnings,
              rp.rating, rp.total_ratings as totalRatings,
              rp.current_order_id as currentOrderId, rp.created_at as createdAt,
              u.name as userName, u.email as userEmail, u.phone as userPhone
       FROM rider_profiles rp
       JOIN users u ON rp.user_id = u.id
       ORDER BY rp.created_at DESC`,
      { type: seq.QueryTypes.SELECT }
    );

    res.json({
      riders: rows.map(r => ({
        id: r.id,
        userId: r.userId,
        vehicleType: r.vehicleType,
        vehicleNumber: r.vehicleNumber,
        isAvailable: !!r.isAvailable,
        approvalStatus: r.approvalStatus,
        totalDeliveries: r.totalDeliveries,
        totalEarnings: r.totalEarnings,
        todayEarnings: r.todayEarnings,
        rating: r.rating,
        totalRatings: r.totalRatings,
        currentOrderId: r.currentOrderId,
        createdAt: r.createdAt,
        user: { id: r.userId, name: r.userName, email: r.userEmail, phone: r.userPhone },
      })),
    });
  } catch (error) {
    console.error('getAllRiders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ADMIN: APPROVE / REJECT RIDER ───────────────────────────────────────────
const approveRider = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be approved or rejected' });

    const profile = await RiderProfile.findOne({ where: { userId: req.params.userId } });
    if (!profile) return res.status(404).json({ message: 'Rider not found' });

    await profile.update({ approvalStatus: status });

    // Send email notification to rider
    try {
      const riderUser = await User.findByPk(req.params.userId);
      if (riderUser && riderUser.email) {
        await sendRiderApprovalEmail(riderUser.email, riderUser.name, status);
      }
    } catch (emailError) {
      console.error('Failed to send rider approval email:', emailError);
    }

    res.json({ message: `Rider ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerRider,
  getRiderProfile,
  toggleAvailability,
  getAvailableOrders,
  acceptOrder,
  markPickedUp,
  markDelivered,
  getActiveOrder,
  getDeliveryHistory,
  getAllRiders,
  approveRider,
};