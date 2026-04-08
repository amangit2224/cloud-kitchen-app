const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/riderController');
const { authenticate, authorize } = require('../middleware/auth');

// ── PUBLIC ────────────────────────────────────────────────────────────────────
router.post('/register', registerRider);

// ── RIDER ONLY ────────────────────────────────────────────────────────────────
router.get('/profile',          authenticate, authorize('rider'), getRiderProfile);
router.put('/availability',     authenticate, authorize('rider'), toggleAvailability);
router.get('/available-orders', authenticate, authorize('rider'), getAvailableOrders);
router.get('/active-order',     authenticate, authorize('rider'), getActiveOrder);
router.get('/history',          authenticate, authorize('rider'), getDeliveryHistory);
router.post('/accept/:orderId', authenticate, authorize('rider'), acceptOrder);
router.put('/picked-up',        authenticate, authorize('rider'), markPickedUp);
router.put('/delivered',        authenticate, authorize('rider'), markDelivered);

// ── ADMIN ONLY ────────────────────────────────────────────────────────────────
router.get('/admin/all',                  authenticate, authorize('admin'), getAllRiders);
router.put('/admin/:userId/approve',      authenticate, authorize('admin'), approveRider);

// ── NEW ADMIN ROUTES FOR RIDER ASSIGNMENT ─────────────────────────────────────
// GET /api/v1/riders/admin/available
// Returns approved + online riders with no active order, for admin to pick from
router.get('/admin/available', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const rows = await sequelize.query(
      `SELECT rp.id, rp.user_id as userId, rp.vehicle_type as vehicleType, rp.rating,
              u.name as userName, u.phone as userPhone
       FROM rider_profiles rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.approval_status = 'approved'
         AND rp.is_available = 1
         AND rp.current_order_id IS NULL
       ORDER BY rp.rating DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json({
      riders: rows.map(r => ({
        id: r.id,
        userId: r.userId,
        vehicleType: r.vehicleType,
        rating: r.rating,
        user: { name: r.userName, phone: r.userPhone },
      })),
    });
  } catch (error) {
    console.error('getAvailableRiders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/v1/riders/admin/assign/:orderId
// Admin manually assigns an available rider to a ready order
router.put('/admin/assign/:orderId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { riderId } = req.body;
    if (!riderId) return res.status(400).json({ message: 'riderId is required' });

    const orders = await sequelize.query(
      "SELECT * FROM orders WHERE id = :id AND status = 'ready'",
      { replacements: { id: req.params.orderId }, type: sequelize.QueryTypes.SELECT }
    );
    if (!orders.length) return res.status(404).json({ message: 'Order not found or not in ready state' });

    const profiles = await sequelize.query(
      "SELECT * FROM rider_profiles WHERE user_id = :rid AND approval_status = 'approved' AND is_available = 1 AND current_order_id IS NULL",
      { replacements: { rid: riderId }, type: sequelize.QueryTypes.SELECT }
    );
    if (!profiles.length) return res.status(400).json({ message: 'Rider is not available' });

    const earning = (parseFloat(orders[0].total_amount) * 0.10).toFixed(2);

    // Update order with rider assignment (basic fields that definitely exist)
    await sequelize.query(
      `UPDATE orders 
       SET rider_id = :rid, rider_accepted_at = NOW()
       WHERE id = :id`,
      { replacements: { rid: riderId, id: req.params.orderId }, type: sequelize.QueryTypes.UPDATE }
    );

    // Try to set earning_amount if column exists (gracefully handle missing column)
    try {
      await sequelize.query(
        'UPDATE orders SET earning_amount = :earn WHERE id = :id',
        { replacements: { earn: earning, id: req.params.orderId }, type: sequelize.QueryTypes.UPDATE }
      );
      console.log('✅ earning_amount updated successfully');
    } catch (e) {
      console.warn('⚠️ earning_amount column not found — skipping. Run migration to add it.');
    }

    // Assign current order to rider profile
    await sequelize.query(
      'UPDATE rider_profiles SET current_order_id = :oid WHERE user_id = :rid',
      { replacements: { oid: req.params.orderId, rid: riderId }, type: sequelize.QueryTypes.UPDATE }
    );

    res.json({ 
      message: 'Rider assigned successfully', 
      earningAmount: earning,
      note: earning ? 'Earning amount will be recorded once column exists' : undefined 
    });
  } catch (error) {
    console.error('❌ assignRider error FULL:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ MUST BE THE LAST LINE - Export the router
module.exports = router;