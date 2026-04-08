const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token for user
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate token from user object
 * @param {Object} user - User object from database
 * @returns {String} JWT token
 */
const createAuthToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  return generateToken(payload);
};

module.exports = {
  generateToken,
  verifyToken,
  createAuthToken
};
