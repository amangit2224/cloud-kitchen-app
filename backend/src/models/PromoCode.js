const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromoCode = sequelize.define('PromoCode', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    set(val) { this.setDataValue('code', val?.toUpperCase().trim()); }
  },
  description: { type: DataTypes.STRING(200), allowNull: true },
  discountType: {
    type: DataTypes.ENUM('percentage', 'flat'),
    allowNull: false,
    defaultValue: 'percentage',
    field: 'discount_type'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'discount_value'
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'min_order_amount'
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'max_discount_amount',
    comment: 'Cap for percentage discounts'
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'usage_limit',
    comment: 'null = unlimited'
  },
  usedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'used_count'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
}, {
  tableName: 'promo_codes',
  underscored: true,
});

module.exports = PromoCode;