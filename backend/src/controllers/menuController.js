const { MenuItem } = require('../models');

/**
 * @route   GET /api/v1/menu
 * @desc    Get all menu items
 * @access  Public
 */
const getAllMenuItems = async (req, res, next) => {
  try {
    const { category, available } = req.query;

    // Build filter conditions
    const where = {};
    if (category) {
      where.category = category;
    }
    if (available !== undefined) {
      where.isAvailable = available === 'true';
    }

    const menuItems = await MenuItem.findAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: {
        menuItems
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/menu/:id
 * @desc    Get single menu item by ID
 * @access  Public
 */
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        menuItem
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/menu
 * @desc    Create new menu item
 * @access  Private (Admin only)
 */
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, preparationTime } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category'
      });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      imageUrl,
      preparationTime
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: {
        menuItem
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/menu/:id
 * @desc    Update menu item
 * @access  Private (Admin only)
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, isAvailable, preparationTime } = req.body;

    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Update fields
    await menuItem.update({
      name: name || menuItem.name,
      description: description !== undefined ? description : menuItem.description,
      price: price || menuItem.price,
      category: category || menuItem.category,
      imageUrl: imageUrl !== undefined ? imageUrl : menuItem.imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : menuItem.isAvailable,
      preparationTime: preparationTime !== undefined ? preparationTime : menuItem.preparationTime
    });

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: {
        menuItem
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/menu/:id
 * @desc    Delete menu item
 * @access  Private (Admin only)
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await menuItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
