const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  menuItemId: { type: DataTypes.INTEGER, allowNull: false, field: 'menu_item_id' },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  specialInstructions: { type: DataTypes.TEXT, allowNull: true, field: 'special_instructions' },
}, {
  tableName: 'order_items',
  underscored: true,
});

module.exports = OrderItem;