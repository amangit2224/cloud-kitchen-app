const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Item name is required'
      },
      len: {
        args: [2, 200],
        msg: 'Item name must be between 2 and 200 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'Price must be a valid decimal number'
      },
      min: {
        args: [0],
        msg: 'Price must be greater than 0'
      }
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Other',
    validate: {
      isIn: {
        args: [['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads', 'Soups', 'Breakfast', 'Snacks', 'Biriyani', 'Rice', 'Breads', 'Other']],
        msg: 'Invalid category'
      }
    }
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url',
    validate: {
      isUrl: {
        msg: 'Please provide a valid URL'
      }
    }
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_available'
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'preparation_time',
    comment: 'Preparation time in minutes',
    validate: {
      min: {
        args: [0],
        msg: 'Preparation time must be positive'
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'menu_items',
  timestamps: true,
  underscored: true
});

module.exports = MenuItem;