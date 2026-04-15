const { body, validationResult } = require('express-validator');

// ── Run validations and return 422 if any fail ────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(422).json({
      success: false,
      message: messages[0],       // first error as top-level message
      errors:  messages,
    });
  }
  next();
};

// ── Auth rules ────────────────────────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter'),

  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s()]{7,15}$/).withMessage('Please provide a valid phone number'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const resetPasswordRules = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// ── Order rules ───────────────────────────────────────────────────────────────
const createOrderRules = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),

  body('items.*.menuItemId')
    .isInt({ min: 1 }).withMessage('Each item must have a valid menu item ID'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 20 }).withMessage('Item quantity must be between 1 and 20'),

  body('deliveryAddress')
    .trim()
    .notEmpty().withMessage('Delivery address is required')
    .isLength({ min: 10 }).withMessage('Please enter a complete delivery address'),

  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]{7,15}$/).withMessage('Please provide a valid phone number'),

  body('paymentMethod')
    .optional()
    .isIn(['cod', 'razorpay']).withMessage('Payment method must be cod or razorpay'),

  body('promoCode')
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 30 }).withMessage('Invalid promo code format'),
];

// ── Menu item rules ───────────────────────────────────────────────────────────
const menuItemRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Breakfast','Lunch','Dinner','Sweets','Beverages','Snacks','Sides','Other'])
    .withMessage('Invalid category'),

  body('preparationTime')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 180 }).withMessage('Preparation time must be between 1 and 180 minutes'),

  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Please provide a valid image URL'),
];

// ── Promo code rules ──────────────────────────────────────────────────────────
const promoRules = [
  body('code')
    .trim()
    .notEmpty().withMessage('Promo code is required')
    .isLength({ min: 2, max: 30 }).withMessage('Code must be between 2 and 30 characters')
    .matches(/^[A-Z0-9_-]+$/i).withMessage('Code can only contain letters, numbers, hyphens and underscores'),

  body('discountType')
    .isIn(['percentage', 'flat']).withMessage('Discount type must be percentage or flat'),

  body('discountValue')
    .isFloat({ min: 0.01 }).withMessage('Discount value must be greater than 0'),

  body('discountValue')
    .if(body('discountType').equals('percentage'))
    .isFloat({ max: 100 }).withMessage('Percentage discount cannot exceed 100%'),

  body('minOrderAmount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Minimum order amount must be 0 or greater'),

  body('usageLimit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  createOrderRules,
  menuItemRules,
  promoRules,
};