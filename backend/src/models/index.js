const User = require('./User');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Favorite = require('./Favorite');
const Address = require('./Address');  

// Define model associations

// User associations
User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders'
});

User.hasMany(Review, {
  foreignKey: 'user_id',
  as: 'reviews'
});

User.hasMany(Favorite, {
  foreignKey: 'user_id',
  as: 'favorites'
});

User.hasMany(Address, { 
  foreignKey: 'user_id',
  as: 'addresses'
});

// MenuItem associations
MenuItem.hasMany(Favorite, {
  foreignKey: 'menu_item_id',
  as: 'favorites'
});

// Order associations
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'orderItems'
});

Order.hasOne(Review, {
  foreignKey: 'order_id',
  as: 'review'
});

// OrderItem associations
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

OrderItem.belongsTo(MenuItem, {
  foreignKey: 'menu_item_id',
  as: 'menuItem'
});

// Review associations
Review.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Review.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// Favorite associations
Favorite.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Favorite.belongsTo(MenuItem, {
  foreignKey: 'menu_item_id',
  as: 'menuItem'
});

// Address associations
Address.belongsTo(User, {  
  foreignKey: 'user_id',
  as: 'user'
});

// Export all models
module.exports = {
  User,
  MenuItem,
  Order,
  OrderItem,
  Review,
  Favorite,
  Address  
};