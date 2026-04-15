const express = require('express');
const router  = express.Router();
const { register, login, getCurrentUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validate, registerRules, loginRules, forgotPasswordRules, resetPasswordRules
} = require('../middleware/validators');

// Public routes — with input validation
router.post('/register',           registerRules,       validate, register);
router.post('/login',              loginRules,          validate, login);
router.post('/forgot-password',    forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

module.exports = router;