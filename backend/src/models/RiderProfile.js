const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const RiderProfile = sequelize.define('RiderProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
  },
  vehicleType: {
    type: DataTypes.ENUM('bicycle', 'motorcycle', 'car'),
    allowNull: false,
    defaultValue: 'motorcycle',
  },
  vehicleNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Goes online manually
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  totalDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  todayEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.00,
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  currentOrderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'rider_profiles',
  timestamps: true,
  underscored: true,
});

module.exports = RiderProfile;