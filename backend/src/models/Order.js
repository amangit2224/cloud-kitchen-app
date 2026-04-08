const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  riderId: { type: DataTypes.INTEGER, allowNull: true, field: 'rider_id' },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'total_amount' },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  riderStatus: { type: DataTypes.STRING(50), allowNull: true, field: 'rider_status' },
  deliveryAddress: { type: DataTypes.TEXT, allowNull: false, field: 'delivery_address' },
  phoneNumber: { type: DataTypes.STRING(20), allowNull: true, field: 'phone_number' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  cancellationReason: { type: DataTypes.TEXT, allowNull: true, field: 'cancellation_reason' },
  earningAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'earning_amount' },
  riderAcceptedAt: { type: DataTypes.DATE, allowNull: true, field: 'rider_accepted_at' },
  riderPickedUpAt: { type: DataTypes.DATE, allowNull: true, field: 'rider_picked_up_at' },
  riderDeliveredAt: { type: DataTypes.DATE, allowNull: true, field: 'rider_delivered_at' },
}, {
  tableName: 'orders',
  underscored: true,
});

module.exports = Order;