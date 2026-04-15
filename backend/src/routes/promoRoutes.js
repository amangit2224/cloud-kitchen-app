const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  validatePromo, getAllPromos, createPromo, updatePromo, deletePromo
} = require('../controllers/promoController');

// Customer — validate a code at checkout
router.post('/validate', authenticate, validatePromo);

// Admin — manage promo codes
router.get('/',       authenticate, authorize('admin'), getAllPromos);
router.post('/',      authenticate, authorize('admin'), createPromo);
router.put('/:id',    authenticate, authorize('admin'), updatePromo);
router.delete('/:id', authenticate, authorize('admin'), deletePromo);

module.exports = router;