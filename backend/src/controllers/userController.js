const { User, Address } = require('../models');
const { Op } = require('sequelize');

// Get user profile with addresses
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt']
    });

    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: { user, addresses }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']]
    });

    res.json({ success: true, data: { addresses } });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add address
const addAddress = async (req, res) => {
  try {
    const { label, address, landmark, phone, isDefault } = req.body;

    if (!address) {
      return res.status(400).json({ success: false, message: 'Address is required' });
    }

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    const newAddress = await Address.create({
      userId: req.user.id,
      label: label || 'Home',
      address,
      landmark: landmark || null,
      phone: phone || null,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address: newAddress }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, address, landmark, phone, isDefault } = req.body;

    const addressRecord = await Address.findOne({
      where: { id, userId: req.user.id }
    });

    if (!addressRecord) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id, id: { [Op.ne]: id } } });
    }

    if (label) addressRecord.label = label;
    if (address) addressRecord.address = address;
    if (landmark !== undefined) addressRecord.landmark = landmark;
    if (phone !== undefined) addressRecord.phone = phone;
    if (isDefault !== undefined) addressRecord.isDefault = isDefault;

    await addressRecord.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address: addressRecord }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const addressRecord = await Address.findOne({
      where: { id, userId: req.user.id }
    });

    if (!addressRecord) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await addressRecord.destroy();

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};