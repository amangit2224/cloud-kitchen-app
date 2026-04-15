const PromoCode = require('../models/PromoCode');
const { Op } = require('sequelize');

/* ── Validate promo code (customer) ─────────────────────────────────────── */
const validatePromo = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res.status(400).json({ success: false, message: 'Code and order amount are required' });
    }

    const promo = await PromoCode.findOne({
      where: { code: code.toUpperCase().trim() }
    });

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Invalid promo code' });
    }

    if (!promo.isActive) {
      return res.status(400).json({ success: false, message: 'This promo code is no longer active' });
    }

    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return res.status(400).json({ success: false, message: 'This promo code has expired' });
    }

    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit' });
    }

    const amount = parseFloat(orderAmount);
    if (amount < parseFloat(promo.minOrderAmount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${parseFloat(promo.minOrderAmount).toFixed(0)} required for this code`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (amount * parseFloat(promo.discountValue)) / 100;
      if (promo.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, parseFloat(promo.maxDiscountAmount));
      }
    } else {
      discountAmount = parseFloat(promo.discountValue);
    }
    discountAmount = Math.min(discountAmount, amount); // can't discount more than order total

    return res.json({
      success: true,
      message: 'Promo code applied!',
      data: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: parseFloat(promo.discountValue),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat((amount - discountAmount).toFixed(2)),
      }
    });
  } catch (error) {
    console.error('validatePromo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ── Get all promo codes (admin) ─────────────────────────────────────────── */
const getAllPromos = async (req, res) => {
  try {
    const promos = await PromoCode.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: { promos } });
  } catch (error) {
    console.error('getAllPromos error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ── Create promo code (admin) ───────────────────────────────────────────── */
const createPromo = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      minOrderAmount, maxDiscountAmount, usageLimit, isActive, expiresAt
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code, type and value are required' });
    }

    const existing = await PromoCode.findOne({ where: { code: code.toUpperCase().trim() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A promo code with this name already exists' });
    }

    const promo = await PromoCode.create({
      code, description, discountType, discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
      expiresAt: expiresAt || null,
    });

    res.status(201).json({ success: true, message: 'Promo code created', data: { promo } });
  } catch (error) {
    console.error('createPromo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ── Update promo code (admin) ───────────────────────────────────────────── */
const updatePromo = async (req, res) => {
  try {
    const promo = await PromoCode.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Promo code not found' });

    await promo.update(req.body);
    res.json({ success: true, message: 'Promo code updated', data: { promo } });
  } catch (error) {
    console.error('updatePromo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ── Delete promo code (admin) ───────────────────────────────────────────── */
const deletePromo = async (req, res) => {
  try {
    const promo = await PromoCode.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Promo code not found' });
    await promo.destroy();
    res.json({ success: true, message: 'Promo code deleted' });
  } catch (error) {
    console.error('deletePromo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { validatePromo, getAllPromos, createPromo, updatePromo, deletePromo };